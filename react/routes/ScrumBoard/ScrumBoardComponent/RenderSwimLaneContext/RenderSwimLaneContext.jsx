import React from 'react';
import { observer } from 'mobx-react';
import classnames from 'classnames';
import { Collapse } from 'choerodon-ui';
import './RenderSwimLaneContext.less';
import SwimLaneHeader from './SwimLaneHeader';

const { Panel } = Collapse;
@observer
class SwimLaneContext extends React.Component {
  constructor(props) {    
    super(props);
    this.state = {
      activeKey: this.getDefaultExpanded(props.mode, [...props.parentIssueArr.values(), props.otherIssueWithoutParent]).slice(0, 15),
    };
  }

  getPanelKey = (mode, issue) => {
    const modeMap = new Map([
      ['swimlane_none', 'swimlaneContext-all'],
      ['assignee', `swimlaneContext-${issue.assigneeId || issue.type}`],
      ['swimlane_epic', `swimlaneContext-${issue.epicId || issue.type}`],
      ['parent_child', `swimlaneContext-${issue.issueId || issue.type || 'other'}`],
    ]);
    return modeMap.get(mode);
  };

  getDefaultExpanded = (mode, issueArr, key) => {
    let retArr = issueArr;
    if (mode === 'parent_child') {
      retArr = retArr.filter(issue => !issue.isComplish || key === 'other');
    }
    return retArr.map(issue => this.getPanelKey(mode, issue));
  };

  getPanelItem = (key, parentIssue = null) => {
    const {
      children, mode, fromEpic, parentIssueArr,
    } = this.props;
    const panelKey = this.getPanelKey(mode, parentIssue, key);
    return (
      <Panel
        showArrow={mode !== 'swimlane_none'}
        key={panelKey}
        className={classnames('c7n-swimlaneContext-container', {
          shouldBeIndent: fromEpic,
          noStoryInEpic: fromEpic && Array.from(parentIssueArr).length === 0,
          [mode]: true,
        })}
        header={(
          <SwimLaneHeader
            parentIssue={parentIssue}
            mode={mode}
            keyId={key}
            subIssueDataLength={parentIssue instanceof Array ? parentIssue.length : parentIssue.subIssueData.length}
          />
        )}
      >
        {children(this.keyConverter(key, mode))}
      </Panel>
    );
  };

  panelOnChange = (arr) => {
    this.setState({
      activeKey: arr,
    });
  };

  keyConverter = (key, mode) => {
    const { epicPrefix } = this.props;
    const retMap = new Map([
      ['parent_child', `parent_child-${key}`],
      ['assignee', `assignee-${key}`],
      ['swimlane_none', 'swimlane_none-other'],
    ]);
    if (epicPrefix) {
      return `${epicPrefix}-${key}`;
    }
    return retMap.get(mode);
  };

  render() {
    const { parentIssueArr, otherIssueWithoutParent, mode } = this.props;
    const { activeKey } = this.state;
    return (
      <Collapse
        activeKey={activeKey}
        onChange={this.panelOnChange}
        bordered={false}
        destroyInactivePanel
      >
        {Array.from(parentIssueArr).map(([key, value]) => this.getPanelItem(key, value))}
        {otherIssueWithoutParent.length && this.getPanelItem('other', otherIssueWithoutParent, 'fromOther')}
      </Collapse>
    );
  }
}

export default SwimLaneContext;
