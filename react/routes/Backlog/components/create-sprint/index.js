import React, { useEffect, useMemo, useState } from 'react';
import {
  Form, TextField, DataSet, TextArea, DateTimePicker, Icon,
} from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';
import moment from 'moment';
import { Choerodon } from '@choerodon/boot';
import SprintApi from '@/api/SprintApi';
import { MAX_LENGTH_SPRINT } from '@/constants/MAX_LENGTH';
import IsInProgramStore from '../../../../stores/common/program/IsInProgramStore';
/**
 * 判断在这个时间范围内时间是否可访问
 * @param {*} startDate 
 * @param {*} endDate 
 */
function stopChooseBetween(time, start, end) {
  // const date = time.format('YYYY-MM-DD HH:mm:ss');
  const startDate = moment(start);
  const endDate = moment(end);
  const endDateZero = moment(end).hour(0).minute(0).second(0);
  if (moment(time).isBetween(startDate, endDateZero, null, '[]')) {
    return false;
  } else if (moment(time).isBetween(endDateZero, endDate, null, '[]')) {
    return false;
  }
  return true;
}

export default function CreateSprint({ modal: { handleOk, close }, onCreate }) {
  async function sprintNameValidator(value, name, record) {
    const isSame = await SprintApi.validate(value);
    return isSame ? '冲刺名称已存在' : true;
  }
  const dataSet = useMemo(() => new DataSet({
    autoCreate: true,
    fields: [
      {
        name: 'sprintName', type: 'string', label: '冲刺名称', required: true, validator: sprintNameValidator,
      },
      {
        name: 'startDate',
        type: 'dateTime',
        label: '开始日期',
        dynamicProps: {
          max: ({ record }) => record.get('endDate'),
        },
      },
      {
        name: 'endDate',
        type: 'dateTime',
        label: '结束日期',
        dynamicProps: {
          min: ({ record }) => record.get('startDate'),
        },
      },
      {
        name: 'sprintGoal', type: 'string', label: '冲刺目标',
      },
    ],
  }));
  async function submit() {
    const isValidate = await dataSet.validate();
    if (isValidate) {
      const [values] = dataSet.toData();
      const sprint = await SprintApi.create(values);
      if (!sprint.failed) {
        onCreate(sprint);
        close();
      } else {
        Choerodon.prompt(sprint.message);
      }
    }
    return false;
  }
  useEffect(() => {
    handleOk(submit);
  }, [handleOk]);

  return (
    <Form dataSet={dataSet}>
      <TextField name="sprintName" required maxLength={MAX_LENGTH_SPRINT} />
      <DateTimePicker name="startDate" />
      <DateTimePicker name="endDate" />
      <TextArea
        rowSpan={2}
        colSpan={2}
        name="sprintGoal"
      // placeholder="请输入冲刺目标"
      />
    </Form>
  );
}
export function CreateCurrentPiSprint({
  modal: { handleOk, close }, onCreate, PiName, sprints, piId,
}) {
  async function sprintNameValidator(value, name, record) {
    const isSame = await SprintApi.validate(value);
    return isSame ? '冲刺名称已存在' : true;
  }
  function checkDateSame(value, name, record) {
    const startDate = record.get('startDate');
    const endDate = record.get('endDate');
    if (startDate && endDate && startDate.isSame(endDate)) {
      return `${name === 'endDate' ? '结束' : '开始'}时间与${name === 'endDate' ? '开始' : '结束'}相同`;
    }
    return true;
  }
  const dataSet = useMemo(() => new DataSet({
    autoCreate: true,
    fields: [
      {
        name: 'sprintName', type: 'string', label: '冲刺名称', required: true, validator: sprintNameValidator,
      },
      {
        name: 'startDate',
        type: 'dateTime',
        label: '开始日期',
        required: true,
        validator: checkDateSame,
        min: moment(IsInProgramStore.piInfo.actualStartDate || IsInProgramStore.piInfo.startDate),
        dynamicProps: {
          max: ({ record }) => {
            const { endDate } = IsInProgramStore.piInfo;
            return record.get('endDate') || moment(endDate, 'YYYY-MM-DD HH:mm:ss');
          },
        },
      },
      {
        name: 'endDate',
        type: 'dateTime',
        label: '结束日期',
        required: true,
        validator: checkDateSame,
        max: moment(IsInProgramStore.piInfo.endDate),
        dynamicProps: {
          min: ({ record }) => {
            const startDate = IsInProgramStore.piInfo.actualStartDate || IsInProgramStore.piInfo.startDate;
            return record.get('startDate') || moment(startDate, 'YYYY-MM-DD HH:mm:ss');
          },
        },
      },
      {
        name: 'sprintGoal', type: 'string', label: '冲刺目标',
      },
    ],
  }));
  async function submit() {
    const isValidate = await dataSet.validate();
    if (isValidate) {
      const [values] = dataSet.toData();

      const sprint = await SprintApi.createOnCurrentPi({ ...values, piId });
      if (!sprint.failed) {
        onCreate(sprint);
        close();
      } else {
        Choerodon.prompt(sprint.message);
      }
    }
    return false;
  }
  function findDateMaxRange(data) {
    let maxDate = null;
    const startDates = sprints.filter(sprint => moment(sprint.startDate).isAfter(data)).map(item => item.startDate);
    if (startDates.length !== 0) {
      // eslint-disable-next-line prefer-destructuring
      maxDate = startDates[0];
      startDates.forEach((startDate) => {
        if (moment(startDate).isBefore(moment(maxDate))) {
          maxDate = moment(startDate);
        }
      });
    }
    return maxDate;
  }
  function findDateMinRange(data) {
    let minDate = null;
    const startDates = sprints.filter(sprint => moment(sprint.startDate).isBefore(data)).map(item => item.endDate);
    if (startDates.length !== 0) {
      // eslint-disable-next-line prefer-destructuring
      minDate = startDates[0];
      startDates.forEach((startDate) => {
        if (moment(startDate).isAfter(moment(minDate))) {
          minDate = moment(startDate);
        }
      });
    }
    return minDate;
  }
  useEffect(() => {
    handleOk(submit);
    IsInProgramStore.loadPiInfoAndSprint();
  }, [handleOk]);

  return (
    <Form dataSet={dataSet}>
      <div>
        <Icon type="info" style={{ marginBottom: '.04rem', marginRight: '.05rem', color: 'rgb(255,0,0,1)' }} />
        创建的冲刺将自动关联当前PI：
        {PiName}
      </div>
      <TextField name="sprintName" required maxLength={MAX_LENGTH_SPRINT} />
      <DateTimePicker
        name="startDate"
        filter={(currentDate, selected) => {
          let isBan = true;
          const currentDateFormat = currentDate.format('YYYY-MM-DD HH:mm:ss');
          // eslint-disable-next-line no-plusplus
          for (let index = 0; index < sprints.length; index++) {
            const { endDate, startDate } = sprints[index];
            if (!stopChooseBetween(currentDateFormat, startDate, endDate)) {
              isBan = false;
              break;
            }
          }
          if (isBan && dataSet.current.get('endDate')) {
            const minTime = findDateMinRange(dataSet.current.get('endDate').format('YYYY-MM-DD HH:mm:ss'));
            if (moment(currentDateFormat).isBefore(minTime)) {
              isBan = false;
            }
          }


          return isBan;
        }}
      />
      <DateTimePicker
        name="endDate"
        filter={(currentDate, selected) => {
          let isBan = true;
          const currentDateFormat = currentDate.format('YYYY-MM-DD HH:mm:ss');
          // eslint-disable-next-line no-plusplus
          for (let index = 0; index < sprints.length; index++) {
            const { endDate, startDate } = sprints[index];
            if (!stopChooseBetween(currentDateFormat, startDate, endDate)) {
              isBan = false;
              break;
            }
          }
          if (isBan && dataSet.current.get('startDate')) {
            const maxTime = findDateMaxRange(dataSet.current.get('startDate').format('YYYY-MM-DD HH:mm:ss'));

            if (moment(currentDateFormat).isAfter(maxTime)) {
              isBan = false;
            }
          }
          return isBan;
        }}
      />
      <TextArea
        rowSpan={2}
        colSpan={2}
        name="sprintGoal"
      // placeholder="请输入冲刺目标"
      />
    </Form>
  );
}
