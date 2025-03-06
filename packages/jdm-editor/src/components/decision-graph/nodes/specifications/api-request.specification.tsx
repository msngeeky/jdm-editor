import { ApiOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import { createVariableType } from '@gorules/zen-engine-wasm';
import React from 'react';

import { TabApiRequest } from '../../../api-request/tab-api-request';
import type { ApiRequestData } from '../../../api-request/types';
import { useDecisionGraphActions } from '../../context/dg-store.context';
import type { NodeSpecification } from './specification-types';
import { NodeKind } from './specification-types';
import { GraphNode } from '../graph-node';
import { NodeColor } from './colors';

export const apiRequestSpecification: NodeSpecification<ApiRequestData> = {
  type: NodeKind.ApiRequest,
  icon: <ApiOutlined style={{ color: 'white' }} />,
  displayName: 'API Request',
  documentationUrl: 'https://docs.example.com/api-request', // Update with actual docs URL
  shortDescription: 'Make HTTP API requests',
  color: NodeColor.Blue,
  renderTab: ({ id }) => <TabApiRequest id={id} />,
  generateNode: ({ index }) => ({
    name: `apiRequest${index}`,
    content: {
      url: '',
      method: 'GET',
      headers: [],
      queryParams: [],
      body: '',
      retryCount: 0,
    },
  }),
  renderNode: ({ id, data, selected, specification }) => {
    const graphActions = useDecisionGraphActions();
    const content = data?.content as ApiRequestData | undefined;

    return (
      <GraphNode
        id={id}
        specification={specification}
        name={data?.name}
        isSelected={selected}
        helper={[
          content?.retryCount ? (
            <span key="retry" style={{ fontSize: '0.8em' }}>
              Retry: {content?.retryCount}
            </span>
          ) : null,
        ]}
        actions={[
          <Button key="edit-request" type="text" onClick={() => graphActions.openTab(id)}>
            Edit Request
          </Button>,
        ]}
      />
    );
  },
  inferTypes: {
    needsUpdate: () => false, // API Request node doesn't need type inference updates
    determineOutputType: () => createVariableType({ type: 'object' }), // API responses are always objects
  },
};
