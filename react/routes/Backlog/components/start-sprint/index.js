import React, { Component } from 'react';
import { observer } from 'mobx-react';
import {
  Form, Select, Input, DatePicker, Icon, message,
} from 'choerodon-ui';
import { Modal } from 'choerodon-ui/pro';
import { stores } from '@choerodon/boot';
import _ from 'lodash';
import moment from 'moment';
import BacklogStore from '@/stores/project/backlog/BacklogStore';
import WorkCalendar from '@/components/WorkCalendar';
import { catchFailed } from '@/common/utils';
import IsInProgramStore from '../../../../stores/common/program/IsInProgramStore';

const FormItem = Form.Item;
const { TextArea } = Input;
const { Option } = Select;
const { AppState } = stores;
const format = 'YYYY-MM-DD';

@observer
class StartSprint extends Component {
  constructor(props) {
    super(props);
    this.state = {
      startDate: null,
      endDate: null,
      showCalendar: false,
      workDates: [], // 冲刺自定义设置
    };
  }

  componentDidMount() {
    const { modal } = this.props;
    modal.handleOk(this.handleStartSprint);
  }

  /**
   *开启冲刺事件
   *
    * @memberof StartSprint
   */
  handleStartSprint = () => {
    const { workDates } = this.state;
    const {
      form, data, modal,
    } = this.props;
    form.validateFields((err, values) => {
      if (!err) {
        const newData = {
          endDate: values.endDate ? `${moment(values.endDate).format('YYYY-MM-DD HH:mm:ss')}` : null,
          startDate: values.startDate ? `${moment(values.startDate).format('YYYY-MM-DD HH:mm:ss')}` : null,
          projectId: AppState.currentMenuType.id,
          sprintGoal: values.goal,
          sprintId: data.sprintId,
          sprintName: values.name,
          objectVersionNumber: data.objectVersionNumber,
          workDates,
        };
        BacklogStore.axiosStartSprint(newData, IsInProgramStore.isShowFeature).then(res => catchFailed(res)).then((res) => {
          modal.close();
          BacklogStore.refresh();
        }).catch((error) => {
          message.error(error);
        });
      }
    });
    return false;
  };

  showWorkCalendar = () => {
    const { showCalendar } = this.state;
    this.setState({ showCalendar: !showCalendar });
  };

  getWorkDays = (startDate, endDate) => {
    // 是否显示非工作日
    const { workSetting } = this.props;
    const {
      saturdayWork,
      sundayWork,
      useHoliday,
      timeZoneWorkCalendarDTOS: selectDays,
      workHolidayCalendarDTOS: holidayRefs,
    } = workSetting;
    const { workDates } = this.state;
    const weekdays = [
      saturdayWork ? null : '六',
      sundayWork ? null : '日',
    ];
    const result = [];
    const beginDay = moment(startDate).format(format).split('-');
    const endDay = moment(endDate).format(format).split('-');
    const diffDay = new Date();
    const dateList = [];
    let i = 0;
    diffDay.setDate(beginDay[2]);
    diffDay.setMonth(beginDay[1] - 1);
    diffDay.setFullYear(beginDay[0]);
    while (i === 0) {
      const localData = moment.localeData();
      // 周六日
      const isWeekDay = weekdays.includes(localData.weekdaysMin(moment(diffDay)));
      // 冲刺自定义设置
      const workDate = workDates.filter(date => date.workDay === moment(diffDay).format('YYYY-MM-DD'));
      // 工作日历自定义设置
      const selectDay = selectDays.filter(date => date.workDay === moment(diffDay).format('YYYY-MM-DD'));
      // 法定假期
      let holiday = false;
      if (useHoliday && holidayRefs.length) {
        holiday = holidayRefs.filter(date => date.holiday === moment(diffDay).format('YYYY-MM-DD'));
      }
      if (workDate.length) {
        if (workDate[0].status === 1) {
          result.push(workDate.workDay);
        }
      } else if (selectDay.length) {
        if (selectDay[0].status === 1) {
          result.push(selectDay.workDay);
        }
      } else if (holiday && holiday.length) {
        if (holiday[0].status === 1) {
          result.push(holiday.holiday);
        }
      } else if (!isWeekDay) {
        result.push(moment(diffDay).format('YYYY-MM-DD'));
      }
      dateList[2] = diffDay.getDate();
      dateList[1] = diffDay.getMonth() + 1;
      dateList[0] = diffDay.getFullYear();
      if (String(dateList[1]).length === 1) { dateList[1] = `0${dateList[1]}`; }
      if (String(dateList[2]).length === 1) { dateList[2] = `0${dateList[2]}`; }
      if (String(dateList[0]) === endDay[0]
        && String(dateList[1]) === endDay[1]
        && String(dateList[2]) === endDay[2]) {
        i = 1;
      }
      const countDay = diffDay.getTime() + 24 * 60 * 60 * 1000;
      diffDay.setTime(countDay);
    }
    return result.length;
  };

  onWorkDateChange = (workDates) => {
    this.setState({
      workDates,
    });
  };

  isDisabledOption(value) {
    if (IsInProgramStore.isShowFeature) {
      const { data: { sprintId }, form: { getFieldValue } } = this.props;
      // const {
      //   startDate,
      // } = this.state;
      // const fieldStartDate = getFieldValue('startDate') || moment();
      // 目前 开始时间限定为当前
      const fieldStartDate = moment();
      const startDateFormat = moment(fieldStartDate).format('YYYY-MM-DD HH:mm:ss');
      const optionDateFormat = moment(startDateFormat).add(parseInt(value, 10), 'w').format('YYYY-MM-DD HH:mm:ss');
      // 时间要在pi结束时间与开始时间内  还要满足时间不能再冲刺范围内
      let isBan = !moment(optionDateFormat).isSameOrBefore(IsInProgramStore.getPiInfo.endDate)
        || !moment(optionDateFormat).isSameOrAfter(IsInProgramStore.piInfo.actualStartDate || IsInProgramStore.piInfo.startDate)
        || IsInProgramStore.stopChooseBetween(optionDateFormat, sprintId); IsInProgramStore.stopChooseBetween(optionDateFormat, sprintId);
      if (!isBan && fieldStartDate) {
        const maxTime = IsInProgramStore.findDateMaxRange(startDateFormat, sprintId);
        if (moment(optionDateFormat).isAfter(maxTime)) {
          isBan = true;
        }
      }
      return isBan;
    }
    return false;
  }

  render() {
    const {
      data,
      data: { sprintId },
      workSetting,
      sprintDetail,
      form: { getFieldDecorator, getFieldValue, setFieldsValue },
    } = this.props;
    const {
      showCalendar,
      startDate,
      endDate,
    } = this.state;
    const { piId, startDate: start, endDate: end } = data;
    const {
      saturdayWork,
      sundayWork,
      useHoliday,
      timeZoneWorkCalendarDTOS: selectDays,
      workHolidayCalendarDTOS: holidayRefs,
    } = workSetting;
    return (
      <div>
        <p className="c7n-closeSprint-message">
          {`该冲刺中包含了${!_.isNull(sprintDetail) ? sprintDetail.issueCount : 0}个问题`}
        </p>
        <Form style={{ width: 512, marginTop: 24 }}>
          <FormItem>
            {getFieldDecorator('name', {
              initialValue: !_.isNull(sprintDetail) ? sprintDetail.sprintName : null,
              rules: [{
                required: true,
                message: '冲刺名称是必填的',
              }],
            })(
              <Input label="Sprint名称" maxLength={30} disabled={!!data.piId} />,
            )}
          </FormItem>
          <FormItem>
            {getFieldDecorator('goal', {
              initialValue: !_.isNull(sprintDetail) ? sprintDetail.sprintGoal : null,
            })(
              <TextArea label="目标" autoSize maxLength={30} />,
            )}
          </FormItem>
          {!piId
            ? (
              <FormItem>
                {getFieldDecorator('duration', {
                  initialValue: '0',
                })(
                  <Select
                    label="周期"
                    onChange={(value) => {
                      if (parseInt(value, 10) > 0) {
                        if (!getFieldValue('startDate')) {
                          setFieldsValue({
                            startDate: moment(),
                          });
                          this.setState({
                            startDate: moment(),
                          });
                        }
                        setFieldsValue({
                          endDate: moment(getFieldValue('startDate')).add(parseInt(value, 10), 'w'),
                        });
                        this.setState({
                          endDate: moment(getFieldValue('startDate')).add(parseInt(value, 10), 'w'),
                        });
                      }
                    }}
                  >
                    <Option value="0">自定义</Option>
                    <Option value="1" disabled={this.isDisabledOption('1')}>1周</Option>
                    <Option value="2" disabled={this.isDisabledOption('2')}>2周</Option>
                    <Option value="4" disabled={this.isDisabledOption('4')}>4周</Option>
                  </Select>,
                )}
              </FormItem>
            ) : ''
          }
          {!piId
            ? (
              <FormItem>
                {getFieldDecorator('startDate', {
                  rules: [{
                    required: true,
                    message: '开始日期是必填的',
                  }],
                  initialValue: start ? (() => {
                    if (IsInProgramStore.isShowFeature) {
                      return moment();
                    } else {
                      return moment(start);
                    }
                  })() : undefined,
                })(
                  <DatePicker
                    style={{ width: '100%' }}
                    label="开始日期"
                    showTime
                    disabled={IsInProgramStore.isShowFeature}
                    format="YYYY-MM-DD HH:mm:ss"
                    disabledDate={(current) => {
                      if (current < moment().subtract(1, 'days')) {
                        return true;
                      }
                      if (endDate && current > moment(endDate)) {
                        return true;
                      }
                      // 用于项目群下开始日期验证
                      // if (current && IsInProgramStore.isShowFeature) {
                      //   const fieldEndDate = getFieldValue('endDate');
                      //   const currentDateFormat = current.format('YYYY-MM-DD HH:mm:ss');
                      //   let isBan = IsInProgramStore.stopChooseBetween(currentDateFormat, sprintId);
                      //   if (!isBan && fieldEndDate) {
                      //     const endDateFormat = moment(fieldEndDate).format('YYYY-MM-DD HH:mm:ss');
                      //     const minTime = IsInProgramStore.findDateMinRange(endDateFormat, sprintId);
                      //     // console.log(isBan, 'current', minTime, current);
                      //     if (moment(currentDateFormat).isBefore(minTime)) {
                      //       isBan = true;
                      //     }
                      //   }

                      //   return isBan;
                      // }
                      return false;
                    }}
                    onChange={(date, dateString) => {
                      setFieldsValue({
                        startDate: date,
                      });
                      this.setState({
                        startDate: date,
                      });
                      if (parseInt(getFieldValue('duration'), 10) > 0) {
                        setFieldsValue({
                          endDate: moment(getFieldValue('startDate')).add(parseInt(getFieldValue('duration'), 10), 'w'),
                        });
                        this.setState({
                          endDate: moment(getFieldValue('startDate')).add(parseInt(getFieldValue('duration'), 10), 'w'),
                        });
                      }
                    }}
                  />,
                )}
              </FormItem>
            ) : (
              <FormItem>
                {getFieldDecorator('startDate', {
                  rules: [{
                    required: true,
                    message: '开始日期是必填的',
                  }],
                  initialValue: moment(start),
                })(
                  <DatePicker
                    style={{ width: '100%' }}
                    label="开始日期"
                    showTime
                    format="YYYY-MM-DD HH:mm:ss"
                    disabled
                  />,
                )}
              </FormItem>
            )
          }
          {!piId
            ? (
              <FormItem>
                {getFieldDecorator('endDate', {
                  rules: [{
                    required: true,
                    message: '结束日期是必填的',
                  }],
                  initialValue: end ? moment(end) : undefined,
                })(
                  <DatePicker
                    style={{ width: '100%' }}
                    label="结束日期"
                    format="YYYY-MM-DD HH:mm:ss"
                    // ip冲刺时禁止结束时间
                    disabled={sprintDetail.type === 'ip' || parseInt(getFieldValue('duration'), 10) > 0}
                    showTime
                    onChange={(date) => {
                      this.setState({
                        endDate: date,
                      });
                    }}
                    disabledDate={(current) => {
                      if (current < moment().subtract(1, 'days')) {
                        return true;
                      }
                      if (startDate && current < moment(startDate)) {
                        return true;
                      }

                      if (current && IsInProgramStore.isShowFeature) {
                        const fieldStartDate = getFieldValue('startDate');
                        const currentDateFormat = current.format('YYYY-MM-DD HH:mm:ss');
                        let isBan = IsInProgramStore.stopChooseBetween(currentDateFormat, sprintId);
                        if (!isBan && fieldStartDate) {
                          const startDateFormat = moment(fieldStartDate).format('YYYY-MM-DD HH:mm:ss');
                          const maxTime = IsInProgramStore.findDateMaxRange(startDateFormat, sprintId);
                          // console.log(isBan, 'current', maxTime, current);
                          // console.log('******************************');
                          if (moment(currentDateFormat).isAfter(maxTime)) {
                            isBan = true;
                          }
                        }

                        return isBan;
                      }
                      return false;
                    }
                    }
                  />,
                )}
              </FormItem>
            ) : (
              <FormItem>
                {getFieldDecorator('endDate', {
                  rules: [{
                    required: true,
                    message: '结束日期是必填的',
                  }],
                  initialValue: moment(end),
                })(
                  <DatePicker
                    style={{ width: '100%' }}
                    label="结束日期"
                    format="YYYY-MM-DD HH:mm:ss"
                    disabled
                    showTime
                  />,
                )}
              </FormItem>
            )
          }
        </Form>
        {!piId && startDate && endDate
          ? (
            <div>
              <div style={{ marginBottom: 20 }}>
                <span style={{ marginRight: 20 }}>
                  {`此Sprint中有${this.getWorkDays(startDate, endDate)}个工作日`}
                </span>
                <Icon type="settings" style={{ verticalAlign: 'top' }} />
                <a onClick={this.showWorkCalendar} role="none">
                  设置当前冲刺工作日
                </a>
              </div>
              {showCalendar
                ? (
                  <WorkCalendar
                    startDate={startDate.format(format)}
                    endDate={endDate.format(format)}
                    mode="BacklogComponent"
                    saturdayWork={saturdayWork}
                    sundayWork={sundayWork}
                    useHoliday={useHoliday}
                    selectDays={selectDays}
                    holidayRefs={holidayRefs}
                    onWorkDateChange={this.onWorkDateChange}
                  />
                ) : null
              }
            </div>
          ) : ''
        }
        {piId
          ? (
            <div>
              <div style={{ marginBottom: 20 }}>
                <span style={{ marginRight: 20 }}>
                  {`此Sprint中有${this.getWorkDays(start, end)}个工作日`}
                </span>
                <Icon type="settings" style={{ verticalAlign: 'top' }} />
                <a onClick={this.showWorkCalendar} role="none">
                  设置当前冲刺工作日
                </a>
              </div>
              {showCalendar
                ? (
                  <WorkCalendar
                    startDate={moment(start).format(format)}
                    endDate={moment(end).format(format)}
                    mode="BacklogComponent"
                    saturdayWork={saturdayWork}
                    sundayWork={sundayWork}
                    useHoliday={useHoliday}
                    selectDays={selectDays}
                    holidayRefs={holidayRefs}
                    onWorkDateChange={this.onWorkDateChange}
                  />
                ) : null
              }
            </div>
          ) : ''
        }

      </div>
    );
  }
}
const FormStartSprint = Form.create()(StartSprint);
export default function (props) {
  Modal.open({
    key: 'sprint',
    title: '开启冲刺',
    okText: '开启',
    cancelText: '取消',
    drawer: true,
    style: {
      width: 740,
    },
    children: <FormStartSprint {...props} />,
  });
}
