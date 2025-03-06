import { ClockCircleOutlined } from '@ant-design/icons';
import { Button, DatePicker, Form, Input, InputNumber, Radio, Select, Switch, Typography } from 'antd';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';

import { useTimerStore } from './context/timer-store.context';
import './timer.scss';
import { TimerType } from './types';

const { Title, Text } = Typography;
const { Option } = Select;

export const Timer: React.FC = () => {
  const {
    timerType,
    durationConfig,
    dateConfig,
    cycleConfig,
    eventConfig,
    description,
    setTimerType,
    setDurationConfig,
    setDateConfig,
    setCycleConfig,
    setEventConfig,
    setDescription,
  } = useTimerStore((state) => state);

  const [selectedDate, setSelectedDate] = useState<dayjs.Dayjs | null>(
    dateConfig?.date ? dayjs(dateConfig.date) : null
  );
  const [selectedTime, setSelectedTime] = useState<dayjs.Dayjs | null>(
    dateConfig?.time ? dayjs(`2000-01-01T${dateConfig.time}`) : null
  );

  useEffect(() => {
    if (selectedDate) {
      setDateConfig({
        ...dateConfig,
        date: selectedDate.format('YYYY-MM-DD'),
      });
    }
  }, [selectedDate]);

  useEffect(() => {
    if (selectedTime) {
      setDateConfig({
        ...dateConfig,
        time: selectedTime.format('HH:mm'),
      });
    }
  }, [selectedTime]);

  const renderDurationConfig = () => (
    <div className="timer-config-section">
      <Title level={5}>Duration Configuration</Title>
      <Form layout="vertical">
        <div className="timer-duration-inputs">
          <Form.Item label="Hours">
            <InputNumber
              min={0}
              max={999}
              value={durationConfig?.hours || 0}
              onChange={(value) => setDurationConfig({ ...durationConfig, hours: value || 0 })}
            />
          </Form.Item>
          <Form.Item label="Minutes">
            <InputNumber
              min={0}
              max={59}
              value={durationConfig?.minutes || 0}
              onChange={(value) => setDurationConfig({ ...durationConfig, minutes: value || 0 })}
            />
          </Form.Item>
          <Form.Item label="Seconds">
            <InputNumber
              min={0}
              max={59}
              value={durationConfig?.seconds || 0}
              onChange={(value) => setDurationConfig({ ...durationConfig, seconds: value || 0 })}
            />
          </Form.Item>
        </div>
      </Form>
    </div>
  );

  const renderDateConfig = () => (
    <div className="timer-config-section">
      <Title level={5}>Date Configuration</Title>
      <Form layout="vertical">
        <Form.Item label="Date">
          <DatePicker
            value={selectedDate}
            onChange={setSelectedDate}
            style={{ width: '100%' }}
          />
        </Form.Item>
        <Form.Item label="Time">
          <DatePicker
            picker="time"
            format="HH:mm"
            value={selectedTime}
            onChange={setSelectedTime}
            style={{ width: '100%' }}
          />
        </Form.Item>
      </Form>
    </div>
  );

  const renderCycleConfig = () => (
    <div className="timer-config-section">
      <Title level={5}>Cycle Configuration</Title>
      <Form layout="vertical">
        <Form.Item label="Cycle Type">
          <Radio.Group
            value={cycleConfig?.type || 'iso8601'}
            onChange={(e) => setCycleConfig({ ...cycleConfig, type: e.target.value })}
          >
            <Radio value="iso8601">ISO 8601</Radio>
            <Radio value="cron">CRON Expression</Radio>
          </Radio.Group>
        </Form.Item>
        <Form.Item label="Value">
          <Input
            value={cycleConfig?.value || ''}
            onChange={(e) => setCycleConfig({ ...cycleConfig, value: e.target.value })}
            placeholder={cycleConfig?.type === 'iso8601' ? 'R/PT5M' : '0 0 12 * * ?'}
          />
        </Form.Item>
        <div className="timer-help-text">
          {cycleConfig?.type === 'iso8601' ? (
            <Text type="secondary">
              ISO 8601 format: R/PTnM (repeat every n minutes), R/PTnH (repeat every n hours)
            </Text>
          ) : (
            <Text type="secondary">
              CRON format: seconds minutes hours day-of-month month day-of-week
            </Text>
          )}
        </div>
      </Form>
    </div>
  );

  const renderEventConfig = () => (
    <div className="timer-config-section">
      <Title level={5}>Event Configuration</Title>
      <Form layout="vertical">
        <Form.Item label="Event Type">
          <Select
            value={eventConfig?.eventType || 'start'}
            onChange={(value) => setEventConfig({ ...eventConfig, eventType: value })}
            style={{ width: '100%' }}
          >
            <Option value="start">Start Event</Option>
            <Option value="intermediate">Intermediate Event</Option>
            <Option value="boundary">Boundary Event</Option>
          </Select>
        </Form.Item>

        {eventConfig?.eventType === 'boundary' && (
          <>
            <Form.Item label="Interrupting">
              <Switch
                checked={eventConfig?.interrupting}
                onChange={(checked) => setEventConfig({ ...eventConfig, interrupting: checked })}
              />
              <Text type="secondary" style={{ marginLeft: 8 }}>
                If enabled, the task will be interrupted when the timer triggers
              </Text>
            </Form.Item>
            <Form.Item label="Escalation Action">
              <Input
                value={eventConfig?.escalationAction || ''}
                onChange={(e) => setEventConfig({ ...eventConfig, escalationAction: e.target.value })}
                placeholder="e.g., Notify manager"
              />
            </Form.Item>
          </>
        )}
      </Form>
    </div>
  );

  return (
    <div className="grl-timer">
      <div className="timer-header">
        <ClockCircleOutlined className="timer-icon" />
        <Title level={4}>Timer Configuration</Title>
      </div>

      <div className="timer-description">
        <Form.Item label="Description">
          <Input
            value={description || ''}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter a description for this timer"
          />
        </Form.Item>
      </div>

      <div className="timer-type-selector">
        <Form.Item label="Timer Type">
          <Radio.Group
            value={timerType}
            onChange={(e) => setTimerType(e.target.value)}
            buttonStyle="solid"
          >
            <Radio.Button value="duration">Duration</Radio.Button>
            <Radio.Button value="date">Date</Radio.Button>
            <Radio.Button value="cycle">Cycle</Radio.Button>
          </Radio.Group>
        </Form.Item>
      </div>

      {timerType === 'duration' && renderDurationConfig()}
      {timerType === 'date' && renderDateConfig()}
      {timerType === 'cycle' && renderCycleConfig()}

      {renderEventConfig()}

      <div className="timer-examples">
        <Title level={5}>Examples</Title>
        <div className="timer-example-buttons">
          <Button
            onClick={() => {
              setTimerType('cycle');
              setCycleConfig({ type: 'iso8601', value: 'R/PT5M' });
              setEventConfig({ eventType: 'start' });
              setDescription('Start Timer Event: Scheduled every 5 minutes');
            }}
          >
            Start Event (5min)
          </Button>
          <Button
            onClick={() => {
              setTimerType('duration');
              setDurationConfig({ minutes: 10 });
              setEventConfig({ eventType: 'intermediate' });
              setDescription('Intermediate Timer Event: Wait for 10 minutes');
            }}
          >
            Wait 10min
          </Button>
          <Button
            onClick={() => {
              setTimerType('duration');
              setDurationConfig({ hours: 1 });
              setEventConfig({ eventType: 'boundary', interrupting: true, escalationAction: 'Notify manager' });
              setDescription('Boundary Timer Event: 1 hour timeout');
            }}
          >
            1hr Timeout
          </Button>
          <Button
            onClick={() => {
              const christmasDate = dayjs('2025-12-25');
              const tenAM = dayjs('2000-01-01T10:00');
              setSelectedDate(christmasDate);
              setSelectedTime(tenAM);
              setTimerType('date');
              setDateConfig({ date: christmasDate.format('YYYY-MM-DD'), time: tenAM.format('HH:mm') });
              setEventConfig({ eventType: 'intermediate' });
              setDescription('Specific Time Date Event: 10:00 AM on December 25, 2025');
            }}
          >
            Christmas 10AM
          </Button>
          <Button
            onClick={() => {
              setTimerType('cycle');
              setCycleConfig({ type: 'cron', value: '0 0 12 * * ?' });
              setEventConfig({ eventType: 'start' });
              setDescription('Repeating Timer: Every day at noon');
            }}
          >
            Daily Noon
          </Button>
        </div>
      </div>
    </div>
  );
};