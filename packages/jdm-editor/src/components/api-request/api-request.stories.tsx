import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';

import { ApiRequest } from './api-request';
import { ApiRequestProvider, createApiRequestStore } from './context/api-request-store.context';

const meta: Meta<typeof ApiRequest> = {
  title: 'Components/ApiRequest',
  component: ApiRequest,
  decorators: [
    (Story) => {
      const store = React.useMemo(() => createApiRequestStore({
        url: 'https://api.example.com/data',
        method: 'GET',
        headers: [
          { key: 'Content-Type', value: 'application/json', enabled: true },
          { key: 'Authorization', value: 'Bearer token', enabled: true },
        ],
        queryParams: [
          { key: 'page', value: '1', enabled: true },
          { key: 'limit', value: '10', enabled: false },
        ],
        body: JSON.stringify({ key: 'value' }, null, 2),
        retryCount: 3,
      }), []);

      return (
        <div style={{ maxWidth: 800, margin: '0 auto', padding: 20 }}>
          <ApiRequestProvider store={store}>
            <Story />
          </ApiRequestProvider>
        </div>
      );
    },
  ],
};

export default meta;
type Story = StoryObj<typeof ApiRequest>;

export const Default: Story = {};

export const EmptyState: Story = {
  decorators: [
    (Story) => {
      const store = React.useMemo(() => createApiRequestStore(), []);
      return (
        <div style={{ maxWidth: 800, margin: '0 auto', padding: 20 }}>
          <ApiRequestProvider store={store}>
            <Story />
          </ApiRequestProvider>
        </div>
      );
    },
  ],
};
