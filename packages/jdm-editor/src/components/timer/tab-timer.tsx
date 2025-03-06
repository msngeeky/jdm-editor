import React, { useEffect } from 'react';

import { useDecisionGraphActions, useDecisionGraphState } from '../decision-graph/context/dg-store.context';
import { Timer } from './timer';
import { TimerProvider, createTimerStore } from './context/timer-store.context';
import type { TimerNodeData } from './types';

export type TabTimerProps = {
  id: string;
};

export const TabTimer: React.FC<TabTimerProps> = ({ id }) => {
  const store = React.useMemo(() => createTimerStore(), []);
  const graphActions = useDecisionGraphActions();
  const { content } = useDecisionGraphState((state) => ({
    content: state.decisionGraph.nodes.find((n) => n.id === id)?.content as TimerNodeData,
  }));

  useEffect(() => {
    if (!content) return;

    store.setState({
      timerType: content.timerType || 'duration',
      durationConfig: content.durationConfig,
      dateConfig: content.dateConfig,
      cycleConfig: content.cycleConfig,
      eventConfig: content.eventConfig || { eventType: 'start' },
      description: content.description || '',
    });
  }, [content]);

  useEffect(() => {
    const unsubscribe = store.subscribe((state) => {
      graphActions.updateNode(id, (draft) => {
        draft.content = {
          timerType: state.timerType,
          durationConfig: state.durationConfig,
          dateConfig: state.dateConfig,
          cycleConfig: state.cycleConfig,
          eventConfig: state.eventConfig,
          description: state.description,
        };
        return draft;
      });
    });

    return () => unsubscribe();
  }, [id, graphActions]);

  return (
    <TimerProvider store={store}>
      <Timer />
    </TimerProvider>
  );
};