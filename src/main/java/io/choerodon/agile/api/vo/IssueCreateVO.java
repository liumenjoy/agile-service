package io.choerodon.agile.api.vo;

import io.choerodon.agile.infra.utils.StringUtil;
import io.swagger.annotations.ApiModelProperty;

import java.math.BigDecimal;
import java.util.List;

/**
 * @author dinghuang123@gmail.com
 */
public class IssueCreateVO {

    @ApiModelProperty(value = "问题类型code")
    private String typeCode;

    @ApiModelProperty(value = "问题概要")
    private String summary;

    @ApiModelProperty(value = "优先级code")
    private String priorityCode;

    @ApiModelProperty(value = "描述")
    private String description;

    @ApiModelProperty(value = "经办人id")
    private Long assigneeId;

    @ApiModelProperty(value = "报告人id")
    private Long reporterId;

    @ApiModelProperty(value = "项目id")
    private Long projectId;

    @ApiModelProperty(value = "史诗id")
    private Long epicId;

    @ApiModelProperty(value = "冲刺id")
    private Long sprintId;

    @ApiModelProperty(value = "优先级id")
    private Long priorityId;

    @ApiModelProperty(value = "问题类型id")
    private Long issueTypeId;

    @ApiModelProperty(value = "关联的版本列表")
    private List<VersionIssueRelVO> versionIssueRelVOList;

    @ApiModelProperty(value = "关联的标签列表")
    private List<LabelIssueRelVO> labelIssueRelVOList;

    @ApiModelProperty(value = "关联的问题链接列表")
    private List<IssueLinkCreateVO> issueLinkCreateVOList;

    @ApiModelProperty(value = "关联的模块列表")
    private List<ComponentIssueRelVO> componentIssueRelVOList;

    @ApiModelProperty(value = "剩余时间")
    private BigDecimal remainingTime;

    @ApiModelProperty(value = "预估时间")
    private BigDecimal estimateTime;

    @ApiModelProperty(value = "史诗名称")
    private String epicName;

    @ApiModelProperty(value = "故事点")
    private BigDecimal storyPoints;

    private Long relateIssueId;

    private Long parentIssueId;

    private RankVO rankVO;

    public List<IssueLinkCreateVO> getIssueLinkCreateVOList() {
        return issueLinkCreateVOList;
    }

    public void setIssueLinkCreateVOList(List<IssueLinkCreateVO> issueLinkCreateVOList) {
        this.issueLinkCreateVOList = issueLinkCreateVOList;
    }

    public void setStoryPoints(BigDecimal storyPoints) {
        this.storyPoints = storyPoints;
    }

    public BigDecimal getStoryPoints() {
        return storyPoints;
    }

    public String getTypeCode() {
        return typeCode;
    }

    public void setTypeCode(String typeCode) {
        this.typeCode = typeCode;
    }

    public String getSummary() {
        return summary;
    }

    public void setSummary(String summary) {
        this.summary = summary;
    }

    public String getPriorityCode() {
        return priorityCode;
    }

    public void setPriorityCode(String priorityCode) {
        this.priorityCode = priorityCode;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Long getAssigneeId() {
        return assigneeId;
    }

    public void setAssigneeId(Long assigneeId) {
        this.assigneeId = assigneeId;
    }

    public Long getProjectId() {
        return projectId;
    }

    public void setProjectId(Long projectId) {
        this.projectId = projectId;
    }

    public Long getEpicId() {
        return epicId;
    }

    public void setEpicId(Long epicId) {
        this.epicId = epicId;
    }

    public Long getSprintId() {
        return sprintId;
    }

    public void setSprintId(Long sprintId) {
        this.sprintId = sprintId;
    }

    public List<VersionIssueRelVO> getVersionIssueRelVOList() {
        return versionIssueRelVOList;
    }

    public void setVersionIssueRelVOList(List<VersionIssueRelVO> versionIssueRelVOList) {
        this.versionIssueRelVOList = versionIssueRelVOList;
    }

    public List<LabelIssueRelVO> getLabelIssueRelVOList() {
        return labelIssueRelVOList;
    }

    public void setLabelIssueRelVOList(List<LabelIssueRelVO> labelIssueRelVOList) {
        this.labelIssueRelVOList = labelIssueRelVOList;
    }

    public List<ComponentIssueRelVO> getComponentIssueRelVOList() {
        return componentIssueRelVOList;
    }

    public void setComponentIssueRelVOList(List<ComponentIssueRelVO> componentIssueRelVOList) {
        this.componentIssueRelVOList = componentIssueRelVOList;
    }

    public BigDecimal getRemainingTime() {
        return remainingTime;
    }

    public BigDecimal getEstimateTime() {
        return estimateTime;
    }

    public void setEstimateTime(BigDecimal estimateTime) {
        this.estimateTime = estimateTime;
    }

    public void setRemainingTime(BigDecimal remainingTime) {
        this.remainingTime = remainingTime;
    }

    public String getEpicName() {
        return epicName;
    }

    public void setEpicName(String epicName) {
        this.epicName = epicName;
    }

    public Long getReporterId() {
        return reporterId;
    }

    public void setReporterId(Long reporterId) {
        this.reporterId = reporterId;
    }

    public void setPriorityId(Long priorityId) {
        this.priorityId = priorityId;
    }

    public Long getPriorityId() {
        return priorityId;
    }

    public void setIssueTypeId(Long issueTypeId) {
        this.issueTypeId = issueTypeId;
    }

    public Long getIssueTypeId() {
        return issueTypeId;
    }

    public void setRelateIssueId(Long relateIssueId) {
        this.relateIssueId = relateIssueId;
    }

    public Long getRelateIssueId() {
        return relateIssueId;
    }

    public void setRankVO(RankVO rankVO) {
        this.rankVO = rankVO;
    }

    public RankVO getRankVO() {
        return rankVO;
    }

    public Long getParentIssueId() {
        return parentIssueId;
    }

    public void setParentIssueId(Long parentIssueId) {
        this.parentIssueId = parentIssueId;
    }

    @Override
    public String toString() {
        return StringUtil.getToString(this);
    }

}
