import { NodeKind } from '../components/decision-graph/nodes/specifications/specification-types';
import type { DecisionNode } from '../components/decision-graph/dg-types';
import type { TimerNodeData } from '../components/timer/types';

/**
 * Converts a Timer node to a Function node
 * @param node The Timer node to convert
 * @returns A Function node with JavaScript code that implements the timer
 */
export const timerToFunction = (node: DecisionNode<TimerNodeData>): DecisionNode => {
  const { content, id, name, position } = node;

  if (!content) {
    throw new Error('Timer node content is undefined');
  }

  // Generate JavaScript code for the timer
  const code = generateTimerCode(content);

  // Create a function node with the generated code
  return {
    id,
    name,
    position,
    type: NodeKind.Function,
    content: {
      source: code
    }
  };
};

/**
 * Generates JavaScript code for a timer
 */
function generateTimerCode(timerData: TimerNodeData): string {
  const { timerType, durationConfig, dateConfig, cycleConfig, eventConfig, description } = timerData;

  // Generate code based on timer type
  let timerImplementation = '';
  let timerDescription = description || 'Timer Event';

  switch (timerType) {
    case 'duration':
      timerImplementation = generateDurationTimerCode(durationConfig, eventConfig);
      break;
    case 'date':
      timerImplementation = generateDateTimerCode(dateConfig, eventConfig);
      break;
    case 'cycle':
      timerImplementation = generateCycleTimerCode(cycleConfig, eventConfig);
      break;
  }

  return `import zen from 'zen';

/**
 * Auto-generated Timer Function
 * ${timerDescription}
 *
 * Timer Type: ${timerType}
 * Event Type: ${eventConfig.eventType}
 *
 * @param {Object} input - The input object
 * @returns {Promise<any>} The timer result
 */
export const handler = async (input) => {
  console.log("Timer event started: ${timerDescription}");

  try {
${timerImplementation}

    // Return the result
    return {
      status: "completed",
      timerType: "${timerType}",
      eventType: "${eventConfig.eventType}",
      input: input,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error("Timer error:", error);
    return {
      status: "error",
      error: error.message,
      timerType: "${timerType}",
      eventType: "${eventConfig.eventType}",
      input: input,
      timestamp: new Date().toISOString()
    };
  }
};`;
}

/**
 * Generates code for a duration timer
 */
function generateDurationTimerCode(
  durationConfig?: { hours?: number; minutes?: number; seconds?: number },
  eventConfig?: { eventType: string; interrupting?: boolean; escalationAction?: string }
): string {
  const hours = durationConfig?.hours || 0;
  const minutes = durationConfig?.minutes || 0;
  const seconds = durationConfig?.seconds || 0;

  const totalMs = (hours * 3600 + minutes * 60 + seconds) * 1000;
  const formattedDuration = `${hours}h ${minutes}m ${seconds}s`;

  let code = `    // Duration timer: ${formattedDuration}
    console.log("Waiting for ${formattedDuration}...");
    await new Promise(resolve => setTimeout(resolve, ${totalMs}));
    console.log("Duration timer completed after ${formattedDuration}");`;

  // Add boundary event handling if applicable
  if (eventConfig?.eventType === 'boundary' && eventConfig?.escalationAction) {
    code += `\n
    // Boundary event escalation
    console.log("Executing escalation action: ${eventConfig.escalationAction}");
    ${eventConfig.interrupting ?
      '// This is an interrupting boundary event - the original task will be stopped' :
      '// This is a non-interrupting boundary event - the original task will continue'}`;
  }

  return code;
}

/**
 * Generates code for a date timer
 */
function generateDateTimerCode(
  dateConfig?: { date?: string; time?: string },
  eventConfig?: { eventType: string; interrupting?: boolean; escalationAction?: string }
): string {
  if (!dateConfig?.date || !dateConfig?.time) {
    return `    // Invalid date configuration
    console.log("Invalid date configuration");
    throw new Error("Invalid date configuration");`;
  }

  const targetDate = `${dateConfig.date}T${dateConfig.time}:00`;

  return `    // Date timer: ${targetDate}
    const targetDate = new Date("${targetDate}");
    const now = new Date();

    if (now >= targetDate) {
      console.log("Target date already passed");
      return;
    }

    const timeToWait = targetDate.getTime() - now.getTime();
    console.log(\`Waiting until ${targetDate} (approximately \${Math.round(timeToWait / 1000 / 60)} minutes)...\`);

    await new Promise(resolve => setTimeout(resolve, timeToWait));
    console.log("Date timer triggered at", new Date().toISOString());`;
}

/**
 * Generates code for a cycle timer
 */
function generateCycleTimerCode(
  cycleConfig?: { type?: string; value?: string },
  eventConfig?: { eventType: string; interrupting?: boolean; escalationAction?: string }
): string {
  if (!cycleConfig?.type || !cycleConfig?.value) {
    return `    // Invalid cycle configuration
    console.log("Invalid cycle configuration");
    throw new Error("Invalid cycle configuration");`;
  }

  if (cycleConfig.type === 'iso8601') {
    // Parse ISO 8601 format (e.g., R/PT5M)
    const match = cycleConfig.value.match(/R\/PT(\d+)([HMS])/i);
    if (!match) {
      return `    // Invalid ISO 8601 format: ${cycleConfig.value}
    console.log("Invalid ISO 8601 format");
    throw new Error("Invalid ISO 8601 format");`;
    }

    const value = parseInt(match[1], 10);
    const unit = match[2].toUpperCase();

    let ms = 0;
    if (unit === 'H') ms = value * 60 * 60 * 1000;
    else if (unit === 'M') ms = value * 60 * 1000;
    else if (unit === 'S') ms = value * 1000;

    return `    // Cycle timer (ISO 8601): ${cycleConfig.value}
    console.log("Setting up cycle timer for ${cycleConfig.value}");

    // In a real environment, you would use a proper scheduler
    // This is a simplified implementation for demonstration
    let iteration = 0;
    const interval = setInterval(() => {
      iteration++;
      console.log(\`Cycle timer triggered (iteration \${iteration})\`);

      // Process the timer event
      // In a real implementation, this would trigger a new process instance

    }, ${ms});

    // For demonstration purposes, we'll run for a few iterations then clear
    await new Promise(resolve => setTimeout(resolve, ${ms * 3}));
    clearInterval(interval);
    console.log("Cycle timer demonstration completed");`;
  } else if (cycleConfig.type === 'cron') {
    return `    // Cycle timer (CRON): ${cycleConfig.value}
    console.log("Setting up cycle timer with CRON expression: ${cycleConfig.value}");

    // In a real environment, you would use a proper CRON scheduler
    // This is a simplified implementation for demonstration
    console.log("CRON scheduling is not implemented in this demo");
    console.log("In a production environment, this would schedule: ${cycleConfig.value}");

    // Simulate a few executions
    for (let i = 1; i <= 3; i++) {
      console.log(\`Simulating CRON execution #\${i}\`);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }`;
  }

  return `    // Unsupported cycle type: ${cycleConfig.type}
    console.log("Unsupported cycle type");
    throw new Error("Unsupported cycle type");`;
}