import { React, PureComponent, Props } from 'packages/core/react';
import { BreadcrumbNavContainer, IBreadcrumbNavLink } from 'packages/app/scenes/Secure/containers/BreadcrumbNavContainer';
import { MainSection } from 'packages/components/app/MainSection';
import { MainView } from 'packages/app/scenes/Secure/containers/MainView';
import { SinglePageTableComponent } from '../components/SinglePageTableComponent';
import { ERoutePath } from 'packages/core/router';
import { IOrganization } from 'packages/api/models/Organization';
import { ICampaign } from 'packages/api/models/Campaign';
import { IAccount } from 'packages/api/models/Account';
import { IAppState } from 'packages/redux/reducers/app';
import { IGetResponse, IListParameters, IExportListParameters, IWidgetParameters, IExportListResponse, IListResponse } from 'packages/core/api';
import { ESinglePageFilterOption } from 'packages/api/models/SinglePage';
import { VisitorsWidget } from 'packages/components/app/VisitorsWidget';
import { CallsWidget } from 'packages/components/app/CallsWidget';
import { ConversionWidget } from 'packages/components/app/ConversionWidget';
import { isClientRole } from 'packages/api/models/Account';
import { SwitchClient } from 'packages/app/scenes/Secure/containers/SwitchClient';
import { DataGridFilter } from 'packages/components/common/datagrid/DataGridFilter';
import { IPerformanceState, IPerformanceWidgetsState } from 'packages/redux/reducers/ui';
import x from 'packages/core/messages';
import * as _ from 'lodash';

const filterOptions = [
	{
		value: ESinglePageFilterOption.All,
		label: x.selectors.campaign_filter.all,
	},
	{
		value: ESinglePageFilterOption.Active,
		label: x.selectors.campaign_filter.active,
	},
	{
		value: ESinglePageFilterOption.Affiliate,
		label: x.selectors.campaign_filter.affiliate,
	},
	{
		value: ESinglePageFilterOption.Email,
		label: x.selectors.campaign_filter.email,
	},
	{
		value: ESinglePageFilterOption.PaidSearch,
		label: x.selectors.campaign_filter.paid_search,
	},
	{
		value: ESinglePageFilterOption.SEO,
		label: x.selectors.campaign_filter.seo,
	},
	{
		value: ESinglePageFilterOption.Social,
		label: x.selectors.campaign_filter.social,
	},
];

interface IClient {
	client: IOrganization;
	performance: ICampaign;
}

interface IProps extends Props<SinglePageView> {
	account: IAccount;
	app: IAppState;
	campaigns: IPerformanceState;
	client: IClient;
	widgets: IPerformanceWidgetsState;
	exportCampaignsToCSV(params: IExportListParameters): Promise<IExportListResponse>;
	exportCampaignsToExcel(params: IExportListParameters): Promise<IExportListResponse>;
	getCampaignsList(params: IListParameters): Promise<IListResponse>;
	getWidgets(parameters: IWidgetParameters): Promise<IGetResponse>;
}

class SinglePageView extends PureComponent<IProps> {
	constructor(props) {
		super(props);

		this.handleFilterChange = this.handleFilterChange.bind(this);
		this.handleSearchChange = this.handleSearchChange.bind(this);
	}

	public componentWillMount() {
		const { offset, limit, sort, q, fetching, filter } = this.props.campaigns;
		const clientNumber = this.getClientNumber(this.props);
		const cidn = this.getCIDN(this.props);
		const range = this.getSelectedDateRange(this.props);

		if (clientNumber && !fetching) {
			this.reloadCampaignList({ offset, limit, sort, q, filter: { ...filter, clientNumber, cidn }, range });
			this.reloadWidgets({ filter: { ...filter, clientNumber }, q, range});
		}
	}

	public componentWillReceiveProps(nextProps) {
		if (!_.isEqual(nextProps.app, this.props.app)) {
			const { offset, limit, sort, q, fetching, filter } = nextProps.campaigns;
			const clientNumber = this.getClientNumber(nextProps);
			const cidn = this.getCIDN(nextProps);
			const range = this.getSelectedDateRange(nextProps);
			const dateRangeChanged = range !== this.getSelectedDateRange(this.props);

			if (clientNumber && !fetching) {
				this.reloadCampaignList({ offset: dateRangeChanged ? 0 : offset, limit, sort, q, filter: { ...filter, clientNumber, cidn }, range });
				this.reloadWidgets({ filter: { ...filter, clientNumber }, q, range });
			}
		}
	}

	private reloadCampaignList(params: IListParameters) {
		this.props.getCampaignsList(params);
	}

	private reloadWidgets(parameters: IWidgetParameters) {
		this.props.getWidgets(parameters);
	}

	private getBreadcrumbLinks(): IBreadcrumbNavLink[] {
		const isClient = isClientRole(this.props.account);
		const cidn = this.getCIDN(this.props);
		const clientNumber = this.getClientNumber(this.props);
		const breadcrumbs: IBreadcrumbNavLink[] = [
			{
				title: x.breadcrumb.labels.performance_central,
				link: ERoutePath.SinglePage
			}
		];
		if ((!isClient && clientNumber) || (isClient && cidn)) {
			breadcrumbs.push({
				title: this.getBreadcrumbTitle(this.props),
				link: ERoutePath.LeadInteractions,
				active: true
			});
		} else {
			breadcrumbs[0].active = true;
		}

		return breadcrumbs;
	}

	private getBreadcrumbTitle(props: IProps) {
		const clientName = this.getClientName(props);
		const cidn = this.getCIDN(props);
		const campaignName = this.getCampaignName(props);
		const adminTitle = cidn ? `${clientName} - ${campaignName} (${cidn})` : clientName;
		const clientTitle = cidn ? `${campaignName} (${cidn})` : '';
		const isClient = isClientRole(props.account);

		return isClient ? clientTitle : adminTitle;
	}

	private getFilterValue() {
		const filter = this.props.campaigns.filter;

		switch (filter.type) {
			case ESinglePageFilterOption.Active:
				return ESinglePageFilterOption.Active;
			case ESinglePageFilterOption.Affiliate:
				return ESinglePageFilterOption.Affiliate;
			case ESinglePageFilterOption.Email:
				return ESinglePageFilterOption.Email;
			case ESinglePageFilterOption.PaidSearch:
				return ESinglePageFilterOption.PaidSearch;
			case ESinglePageFilterOption.SEO:
				return ESinglePageFilterOption.SEO;
			case ESinglePageFilterOption.Social:
				return ESinglePageFilterOption.Social;
			default:
				return ESinglePageFilterOption.All;
		}
	}

	private getClientNumber(props: IProps) {
		return _.get(props, 'app.selectedClient.clientNumber');
	}

	private getClientName(props: IProps) {
		return _.get(props, 'app.selectedClient.name');
	}

	private getCIDN(props: IProps) {
		return _.get(props, 'app.selectedCampaign.cidn');
	}

	private getCampaignName(props: IProps) {
		return _.get(props, 'app.selectedCampaign.name');
	}

	private getSelectedDateRange(props: IProps) {
		return _.get(props, 'app.selectedDateRange');
	}

	private handleFilterChange(value) {
		const { sort, q, limit } = this.props.campaigns;
		const clientNumber = this.getClientNumber(this.props);
		const range = this.getSelectedDateRange(this.props);
		let newFilter: any;

		switch (value) {
			case ESinglePageFilterOption.Active:
				newFilter = { status: ESinglePageFilterOption.Active };
				break;
			case ESinglePageFilterOption.All:
				newFilter = { type: '' };
				break;
			case ESinglePageFilterOption.Affiliate:
				newFilter = { type: ESinglePageFilterOption.Affiliate };
				break;
			case ESinglePageFilterOption.Email:
				newFilter = { type: ESinglePageFilterOption.Email };
				break;
			case ESinglePageFilterOption.PaidSearch:
				newFilter = { type: ESinglePageFilterOption.PaidSearch };
				break;
			case ESinglePageFilterOption.SEO:
				newFilter = { type: ESinglePageFilterOption.SEO };
				break;
			case ESinglePageFilterOption.Social:
				newFilter = { type: ESinglePageFilterOption.Social };
				break;
		}

		newFilter.clientNumber = clientNumber;

		this.reloadCampaignList({ offset: 0, limit, sort, q, filter: newFilter, range });
		this.reloadWidgets({ filter: newFilter, q, range});
	}

	private handleSearchChange(q: string) {
		const { limit, sort, filter } = this.props.campaigns;
		const range = this.getSelectedDateRange(this.props);

		this.reloadCampaignList({ offset: 0, limit, sort, q, filter, range });
		this.reloadWidgets({ filter, q, range});
	}

	private renderContent() {
		const { SinglePage_TotalViews, SinglePage_CallGenerated, SinglePage_AverageConversion } = this.props.widgets.result;
		const range = this.getSelectedDateRange(this.props);

		if (!this.getClientNumber(this.props)) {
			return (
				<MainSection>
					<div className="row">
						<div className="col-xs-10 col-xs-offset-1 col-md-4 col-md-offset-4">
							<div className="ibox float-e-margins">
								<div className="ibox-content">
									<h3 className="text-center">{x.errors.empty_client_number}</h3>
									<SwitchClient />
								</div>
							</div>
						</div>
					</div>
				</MainSection>
			);
		}

		return (
			<MainSection>
				<DataGridFilter
					bottomIndent={false}
					displayDataPicker
					filterOptions={ filterOptions }
					filterValue={ this.getFilterValue() }
					full
					onFilter={ this.handleFilterChange }
					onSearch={ this.handleSearchChange }
					search={ this.props.campaigns.q }
					searchPlaceholder={ x.placeholders.campaign_search }
				/>

				<div className="row m-b-md">
					<div className="col-xs-12 col-md-4">
						{!_.isEmpty(SinglePage_TotalViews) && <VisitorsWidget period={ range } widget={ SinglePage_TotalViews } />}
					</div>

					<div className="col-xs-12 col-md-4">
						{!_.isEmpty(SinglePage_CallGenerated) && <CallsWidget period={ range } widget={ SinglePage_CallGenerated } />}
					</div>

					<div className="col-xs-12 col-md-4">
						{!_.isEmpty(SinglePage_AverageConversion) && <ConversionWidget period={ range } title="Sales Conversions" widget={ SinglePage_AverageConversion } />}
					</div>
				</div>

				<div className="row m-b-md">
					<div className="col-lg-12">
						<div className="ibox float-e-margins">
							<div className="ibox-content">
								<SinglePageTableComponent
									campaigns={this.props.campaigns}
									client={this.props.app.selectedClient}
									exportCampaignsToCSV={this.props.exportCampaignsToCSV}
									exportCampaignsToExcel={this.props.exportCampaignsToExcel}
									getCampaignList={this.props.getCampaignsList}
									range={range}
									showCampaignName={!this.getCIDN(this.props)}
								/>
							</div>
						</div>
					</div>
				</div>
			</MainSection>
		);
	}

	public render() {
		const breadcrumb = <BreadcrumbNavContainer title={ x.breadcrumb.labels.performance_central } links={ this.getBreadcrumbLinks() } />;

		return (
			<MainView breadcrumb={ breadcrumb } switchClient={this.getClientNumber(this.props)}>
				{this.renderContent()}
			</MainView>
		);
	}
}

export default SinglePageView;
