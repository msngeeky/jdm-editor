import React, { useEffect } from 'react';

import { useDecisionGraphActions, useDecisionGraphState } from '../decision-graph/context/dg-store.context';
import { ApiRequest } from './api-request';
import { ApiRequestProvider, createApiRequestStore } from './context/api-request-store.context';
import type { ApiRequestData } from './types';

export type TabApiRequestProps = {
  id: string;
};

export const TabApiRequest: React.FC<TabApiRequestProps> = ({ id }) => {
  const store = React.useMemo(() => createApiRequestStore(), []);
  const graphActions = useDecisionGraphActions();
  const { content } = useDecisionGraphState((state) => ({
    content: state.decisionGraph.nodes.find((n) => n.id === id)?.content as ApiRequestData,
  }));

  useEffect(() => {
    store.setState({
      url: content?.url ?? '',
      method: content?.method ?? 'GET',
      headers: content?.headers ?? [],
      queryParams: content?.queryParams ?? [],
      body: content?.body ?? '',
      retryCount: content?.retryCount ?? 0,
    });
  }, [content]);

  useEffect(() => {
    const unsubscribe = store.subscribe((state) => {
      graphActions.updateNode(id, (draft) => {
        draft.content = {
          url: state.url,
          method: state.method,
          headers: state.headers,
          queryParams: state.queryParams,
          body: state.body,
          retryCount: state.retryCount,
        };
        return draft;
      });
    });

    return () => unsubscribe();
  }, [id, graphActions]);

  return (
    <ApiRequestProvider store={store}>
      <ApiRequest />
    </ApiRequestProvider>
  );
};
