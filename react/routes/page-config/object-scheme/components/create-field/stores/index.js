import React, { createContext, useEffect } from 'react';
import { inject } from 'mobx-react';
import { DataSet } from 'choerodon-ui/pro';
import moment from 'moment';
import FormDataSet from './FormDataSet';
import UserOptionDataSet from './UserOptionDataSet';
import useStore from './useStore';

const Store = createContext();
export default Store;

export const StoreProvider = inject('AppState')(
  (props) => {
    const {
      formatMessage, AppState: { currentMenuType: { type, id, organizationId } }, schemeCode, record,
    } = props;
    const isEdit = !!record;
    const store = useStore(type, id, organizationId);
    const defaultUserId = isEdit && record.get('defaultValue');
    const userOptionDataSet = new DataSet(UserOptionDataSet({
      type, id, defaultUserId, isEdit,
    }));
    const formDataSet = new DataSet(FormDataSet({
      formatMessage, type, store, schemeCode, id, organizationId, isEdit, oldRecord: record, userOptionDataSet,
    }));

    useEffect(() => {
      if (isEdit) {
        formDataSet.transport.read = () => ({
          url: `/agile/v1/${type}s/${id}/object_scheme_field/${record.get('id')}?organizationId=${organizationId}`,
          method: 'get',
        });
        formDataSet.query().then((data) => {
          const dateList = ['time', 'datetime', 'date'];
          const multipleList = ['checkbox', 'multiple'];
          const dateFormat = 'YYYY-MM-DD HH:mm:ss';
          if (dateList.indexOf(data.fieldType) !== -1) {
            // 格式化日期类型
            formDataSet.current.set('defaultValue', data.defaultValue ? moment(data.defaultValue).format(dateFormat) : undefined);
            // 变换数据，从extraConfig -> check
            formDataSet.current.set('check', data.extraConfig);
          }
          if (data.fieldType === 'number') {
            formDataSet.current.set('check', data.extraConfig);
          }
          // 进行初始化 防止进入编辑时只显示id
          if (data.fieldType === 'member') {
            userOptionDataSet.setQueryParameter('userId', data.defaultValue);
            userOptionDataSet.query();
          }
          if (data.context && data.context[0] === 'global') {
            const arr = formDataSet.current.getField('context').options.map(item => item.get('valueCode'));
            formDataSet.current.set('context', arr);
          }
          if (multipleList.indexOf(data.fieldType) !== -1) {
            formDataSet.current.set('defaultValue', data.defaultValue && data.defaultValue.split && data.defaultValue.split(','));
          }
        });
      }
    }, []);


    const value = {
      ...props,
      isEdit,
      formDataSet,
      userOptionDataSet,
    };

    return (
      <Store.Provider value={value}>
        {props.children}
      </Store.Provider>
    );
  },
);
