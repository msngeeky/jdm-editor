import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Input, InputNumber, Select, Switch, Table, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React from 'react';

import { useApiRequestStore } from './context/api-request-store.context';
import './api-request.scss';
import type { ApiRequestMethod, ApiRequestParam } from './types';

const HTTP_METHODS: ApiRequestMethod[] = ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'HEAD'];

type ParamsTableProps = {
  value: ApiRequestParam[];
  onChange: (params: ApiRequestParam[]) => void;
};

const ParamsTable: React.FC<ParamsTableProps> = ({ value, onChange }) => {
  const columns: ColumnsType<ApiRequestParam> = [
    {
      title: 'Enabled',
      dataIndex: 'enabled',
      width: 80,
      render: (enabled: boolean, record, index) => (
        <Switch
          size="small"
          checked={enabled}
          onChange={(checked) => {
            const newParams = [...value];
            newParams[index] = { ...record, enabled: checked };
            onChange(newParams);
          }}
        />
      ),
    },
    {
      title: 'Key',
      dataIndex: 'key',
      render: (key: string, record, index) => (
        <Input
          size="small"
          value={key}
          onChange={(e) => {
            const newParams = [...value];
            newParams[index] = { ...record, key: e.target.value };
            onChange(newParams);
          }}
        />
      ),
    },
    {
      title: 'Value',
      dataIndex: 'value',
      render: (val: string, record, index) => (
        <Input
          size="small"
          value={val}
          onChange={(e) => {
            const newParams = [...value];
            newParams[index] = { ...record, value: e.target.value };
            onChange(newParams);
          }}
        />
      ),
    },
    {
      title: '',
      width: 50,
      render: (_, __, index) => (
        <Button
          size="small"
          type="text"
          icon={<DeleteOutlined />}
          onClick={() => {
            const newParams = [...value];
            newParams.splice(index, 1);
            onChange(newParams);
          }}
        />
      ),
    },
  ];

  return (
    <div className="grl-api-request__params-table">
      <Table
        size="small"
        columns={columns}
        dataSource={value}
        pagination={false}
        rowKey={(record, index) => `${record.key}-${index}`}
      />
      <div className="grl-api-request__params-table__actions">
        <Button
          size="small"
          type="dashed"
          icon={<PlusOutlined />}
          onClick={() => {
            onChange([...value, { key: '', value: '', enabled: true }]);
          }}
        >
          Add Row
        </Button>
      </div>
    </div>
  );
};

export const ApiRequest: React.FC = () => {
  const {
    url,
    method,
    headers,
    queryParams,
    body,
    retryCount,
    setUrl,
    setMethod,
    setHeaders,
    setQueryParams,
    setBody,
    setRetryCount,
  } = useApiRequestStore((state) => state);

  return (
    <div className="grl-api-request">
      <div className="grl-api-request__section">
        <div className="grl-api-request__url-row">
          <Select value={method} onChange={setMethod}>
            {HTTP_METHODS.map((m) => (
              <Select.Option key={m} value={m}>
                {m}
              </Select.Option>
            ))}
          </Select>
          <Input
            placeholder="Enter URL"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
        </div>
      </div>

      <div className="grl-api-request__section">
        <div className="grl-api-request__section__header">
          <Typography.Text strong>Query Parameters</Typography.Text>
        </div>
        <div className="grl-api-request__section__content">
          <ParamsTable value={queryParams} onChange={setQueryParams} />
        </div>
      </div>

      <div className="grl-api-request__section">
        <div className="grl-api-request__section__header">
          <Typography.Text strong>Headers</Typography.Text>
        </div>
        <div className="grl-api-request__section__content">
          <ParamsTable value={headers} onChange={setHeaders} />
        </div>
      </div>

      {method !== 'GET' && method !== 'HEAD' && (
        <div className="grl-api-request__section">
          <div className="grl-api-request__section__header">
            <Typography.Text strong>Body</Typography.Text>
          </div>
          <div className="grl-api-request__section__content">
            <Input.TextArea
              rows={4}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Enter request body"
            />
          </div>
        </div>
      )}

      <div className="grl-api-request__section">
        <div className="grl-api-request__retry">
          <Typography.Text>Retry Count:</Typography.Text>
          <InputNumber
            min={0}
            max={10}
            value={retryCount}
            onChange={(value) => setRetryCount(value ?? 0)}
          />
        </div>
      </div>
    </div>
  );
};
