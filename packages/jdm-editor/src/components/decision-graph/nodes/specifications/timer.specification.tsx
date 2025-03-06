import { ClockCircleOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import { createVariableType } from '@gorules/zen-engine-wasm';
import React from 'react';

import { TabTimer } from '../../../timer/tab-timer';
import type { TimerNodeData } from '../../../timer/types';
import { useDecisionGraphActions } from '../../context/dg-store.context';
import type { NodeSpecification } from './specification-types';
import { NodeKind } from './specification-types';
import { GraphNode } from '../graph-node';
import { NodeColor } from './colors';

// TimerNode is already defined in specification-types.ts

export const timerSpecification: NodeSpecification<TimerNodeData> = {
  type: NodeKind.TimerNode,
  icon: <ClockCircleOutlined style={{ color: 'white' }} />,
  displayName: 'Timer',
  documentationUrl: 'https://docs.example.com/timer', // Update with actual docs URL
  shortDescription: 'Configure timer events',
  color: NodeColor.Purple,
  renderTab: ({ id }) => <TabTimer id={id} />,
  generateNode: ({ index }) => ({
    name: `timer${index}`,
    content: {
      timerType: 'duration',
      durationConfig: {
        hours: 0,
        minutes: 0,
        seconds: 0
      },
      eventConfig: {
        eventType: 'start'
      },
      description: ''
    },
  }),
  renderNode: ({ id, data, selected, specification }) => {
    const graphActions = useDecisionGraphActions();
    const content = data?.content as TimerNodeData | undefined;

    // Format the timer description for display
    const getTimerDescription = () => {
      if (!content) return 'Timer';

      if (content.description) {
        return content.description;
      }

      switch (content.timerType) {
        case 'duration':
          const hours = content.durationConfig?.hours || 0;
          const minutes = content.durationConfig?.minutes || 0;
          const seconds = content.durationConfig?.seconds || 0;
          return `Duration: ${hours}h ${minutes}m ${seconds}s`;
        case 'date':
          if (content.dateConfig?.date && content.dateConfig?.time) {
            return `Date: ${content.dateConfig.date} ${content.dateConfig.time}`;
          }
          return 'Date Timer';
        case 'cycle':
          if (content.cycleConfig?.value) {
            return `Cycle: ${content.cycleConfig.value}`;
          }
          return 'Cycle Timer';
        default:
          return 'Timer';
      }
    };

    // Get the event type icon/label
    const getEventTypeLabel = () => {
      if (!content?.eventConfig) return null;

      switch (content.eventConfig.eventType) {
        case 'start':
          return <span key="event-type" style={{ fontSize: '0.8em' }}>Start Event</span>;
        case 'intermediate':
          return <span key="event-type" style={{ fontSize: '0.8em' }}>Intermediate Event</span>;
        case 'boundary':
          return <span key="event-type" style={{ fontSize: '0.8em' }}>
            Boundary Event {content.eventConfig.interrupting ? '(Interrupting)' : '(Non-interrupting)'}
          </span>;
        default:
          return null;
      }
    };

    return (
      <GraphNode
        id={id}
        specification={specification}
        name={data?.name}
        isSelected={selected}
        helper={[
          getEventTypeLabel(),
          <span key="timer-desc" style={{ fontSize: '0.8em' }}>{getTimerDescription()}</span>
        ]}
        actions={[
          <Button key="edit-timer" type="text" onClick={() => graphActions.openTab(id)}>
            Edit Timer
          </Button>,
        ]}
      />
    );
  },
  inferTypes: {
    needsUpdate: () => false, // Timer node doesn't need type inference updates
    determineOutputType: () => createVariableType({ type: 'object' }), // Timer events always return objects
  },
};