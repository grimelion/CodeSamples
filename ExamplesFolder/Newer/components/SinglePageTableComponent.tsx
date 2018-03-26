import { React, PureComponent, Props } from 'packages/core/react';
import { Redirect } from 'react-router';
import { ERoutePath } from 'packages/core/router';
import { ErrorAlert } from 'packages/components/common/ErrorAlert';
import { DataGrid } from 'packages/components/common/datagrid/DataGrid';
import { IListParameters, IListResponse, EListSortOrder, IExportListParameters, IExportListResponse } from 'packages/core/api';
import { ISinglePage } from 'packages/api/models/SinglePage';
import { EExportFormat } from 'packages/api/models/Export';
import NumberFormat from 'react-number-format';
import { IOrganization } from 'packages/api/models/Organization';
import { EDataGridAlignment, IDataGridSchema } from 'packages/api/models/DataGrid';
import { EAccountStatus, accountStatusFormatter } from 'packages/api/models/Account';
import { IPerformanceState } from 'packages/redux/reducers/ui';
import { Trend } from 'packages/components/app/Trend';
import { switchClientTo } from 'packages/redux/actions/switchClient';
import { EDateRange } from 'packages/api/models/DateRangePicker';
import { timeFormatter } from 'packages/core/utils';
import { IBasicCampaign } from 'packages/api/models/Campaign';
import { Tooltip } from 'packages/components/common/Tooltip';
import { Icon } from 'packages/components/common/Icon';
import { phoneFormatter } from 'packages/core/utils';
import x from 'packages/core/messages';

interface IProps extends Props<SinglePageTableComponent> {
	client: IOrganization;
	campaigns: IPerformanceState;
	getCampaignList(params: IListParameters): Promise<IListResponse>;
	exportCampaignsToCSV(params: IExportListParameters): Promise<IExportListResponse>;
	exportCampaignsToExcel(params: IExportListParameters): Promise<IExportListResponse>;
	range: EDateRange;
	showCampaignName?: boolean;
}

interface IState {
	readonly exporting: boolean;
	readonly redirecting: boolean;
	readonly redirectTo: string;
}

const generateTooltip = (campaign: ISinglePage) => {
	return `
		cidn: ${ campaign.cidn }<br>
		type: ${ campaign.type }<br>
		campaignNumber: ${ phoneFormatter('8005551212') }<br>
		status: ${ campaign.status }
	`;
};

const gridSchema = (props: IProps): IDataGridSchema<ISinglePage> => {
	const headers: any = {};

	if (props.showCampaignName) {
		headers.campaignName = {
			label: x.grid.headers.campaign_name,
			alignment: EDataGridAlignment.Left,
			sortFields: ['name'],
			formatter: (item) => (
				<Tooltip alignment={ 'left' } message={ generateTooltip(item) } multiline={ true }>
					<Icon name="question-circle" />
					<span className="table-tooltip"> {item.name || x.values.na} </span>
				</Tooltip>
			)
		};
	}

	const defaultHeaders = {
		id: {
			label: x.grid.headers.campaign_type,
			formatter: ({type}) => type || x.values.na,
		},
		spend: {
			label: x.grid.headers.spend,
			sortFields: ['spend'],
			formatter: ({spend}) => (
				<NumberFormat value={`${spend}`} displayType={'text'} thousandSeparator={true} prefix={'$'} />
			),
		},
		impressions: {
			label: x.grid.headers.impressions,
			alignment: EDataGridAlignment.Left,
			sortFields: ['impressions'],
			formatter: ({impressions}) => (
				<NumberFormat value={`${impressions}`} displayType={'text'} thousandSeparator={true} />
			),
		},
		clicks: {
			label: x.grid.headers.clicks,
			alignment: EDataGridAlignment.Left,
			sortFields: ['clicks'],
			formatter: ({clicks}) => (
				<NumberFormat value={`${clicks}`} displayType={'text'} thousandSeparator={true} />
			),
		},
		cpc: {
			label: x.grid.headers.cpc,
			alignment: EDataGridAlignment.Left,
			sortFields: ['cpc'],
			formatter: ({cpc}) => (
				<NumberFormat value={`${cpc}`} displayType={'text'} thousandSeparator={true} prefix={'$'} />
			),
		},
		cpcTrend: {
			label: x.grid.headers.cpcTrend,
			alignment: EDataGridAlignment.Left,
			sortFields: ['cpcTrend'],
			formatter: ({cpcTrend}) => cpcTrend ? <Trend trend={cpcTrend} /> : x.values.na
		},
		ctr: {
			label: x.grid.headers.ctr,
			alignment: EDataGridAlignment.Left,
			sortFields: ['ctr'],
			formatter: ({ctr}) => (
				<NumberFormat value={`${Math.round(ctr)}`} displayType={'text'} suffix={'%'} />
			),
		},
		calls: {
			label: x.grid.headers.total_calls,
			alignment: EDataGridAlignment.Left,
			sortFields: ['totalCalls'],
			formatter: ({totalCalls}) => totalCalls,
		},
		salesCalls: {
			label: x.grid.headers.sales_calls,
			alignment: EDataGridAlignment.Left,
			sortFields: ['salesCalls'],
			formatter: ({salesCalls}) => salesCalls,
		},
		durationInMillis: {
			label: x.grid.headers.sales_duration,
			sortFields: ['salesCallsDurationInMillis'],
			formatter: ({salesCallsDurationInMillis}) => salesCallsDurationInMillis ? timeFormatter(salesCallsDurationInMillis) : x.values.na,
		},
		status: {
			label: x.grid.headers.status,
			sortFields: ['status'],
			formatter: ({ status }) => {
				const value = accountStatusFormatter(status);
				switch (status) {
					case EAccountStatus.Active:
						return <span className="label label-primary">{ value }</span>;
					case EAccountStatus.Disabled:
						return <span className="label label-danger">{ value }</span>;
				}
			},
		},
		conversions: {
			label: x.grid.headers.conversions,
			alignment: EDataGridAlignment.Left,
			sortFields: ['converted'],
			formatter: ({converted}) => converted,
		},
		cpa: {
			label: x.grid.headers.cpa,
			alignment: EDataGridAlignment.Left,
			sortFields: ['cpa'],
			formatter: ({cpa}) => cpa ? (
				<NumberFormat value={`${cpa}`} displayType={'text'} thousandSeparator={true} prefix={'$'} />
			) : x.values.na,
		},
		cpaTrend: {
			label: x.grid.headers.cpaTrend,
			alignment: EDataGridAlignment.Left,
			sortFields: ['cpaTrend'],
			formatter: ({cpaTrend}) => cpaTrend ? <Trend trend={cpaTrend} /> : x.values.na
		},
	};

	return {
		headers: { ...headers, ...defaultHeaders },
		permissions: () => ({
			viewCampaignLeads: true,
		}),
		actions: {
			viewCampaignLeads: {
				tooltip: x.grid.actions.view,
				icon: 'eye'
			}
		}
	};
};

export class SinglePageTableComponent extends PureComponent<IProps, IState> {
	public static defaultProps: Partial<IProps> = {
		showCampaignName: true,
	};

	constructor(props) {
		super(props);

		this.state = {
			exporting: false,
			redirecting: false,
			redirectTo: '',
		};

		this.handleGridOffsetChange = this.handleGridOffsetChange.bind(this);
		this.handleGridLimitChange = this.handleGridLimitChange.bind(this);
		this.handleAction = this.handleAction.bind(this);
		this.handleOrderChange = this.handleOrderChange.bind(this);
		this.exportCampaignsToCSV = this.exportCampaignsToCSV.bind(this);
		this.exportCampaignsToExcel = this.exportCampaignsToExcel.bind(this);
	}

	private exportCampaignsToCSV() {
		const { q, filter, sort } = this.props.campaigns;

		if (this.state.exporting) {
			return;
		}

		this.setState({ exporting: true });

		return this.props.exportCampaignsToCSV({ q, filter, sort, format: EExportFormat.csv, range: this.props.range })
			.then(() => {
				this.setState({ exporting: false });
			});
	}

	private exportCampaignsToExcel() {
		const { q, filter, sort } = this.props.campaigns;

		if (this.state.exporting) {
			return;
		}

		this.setState({ exporting: true });

		return this.props.exportCampaignsToExcel({ q, filter, sort, format: EExportFormat.excel, range: this.props.range })
			.then(() => {
				this.setState({ exporting: false });
			});
	}

	private reloadCampaignList(params: IListParameters) {
		this.props.getCampaignList(params);
	}

	private handleOrderChange(fields: string[], order: EListSortOrder) {
		const { limit, offset, q, filter } = this.props.campaigns;

		this.reloadCampaignList({ limit, offset, sort: { fields, order }, q, filter, range: this.props.range });
	}

	private handleGridOffsetChange(offset: number) {
		const { limit, sort, q, filter } = this.props.campaigns;

		this.reloadCampaignList({ offset, limit, sort, q, filter, range: this.props.range });
	}

	private handleGridLimitChange(limit: number) {
		const { sort, q, filter } = this.props.campaigns;

		this.reloadCampaignList({ offset: 0, limit, sort, q, filter, range: this.props.range });
	}

	private handleAction(key: string, item: any) {
		const { cidn, clientNumber, id, name } = item;
		const campaign: IBasicCampaign  = {
			id,
			cidn,
			clientNumber,
			name,
		};
		switchClientTo(this.props.client, campaign);

		this.setState({
			redirecting: true,
			redirectTo: key,
		});
	}

	public render() {
		if (this.props.campaigns.error) {
			return <ErrorAlert error={ this.props.campaigns.error } reload={ true } />;
		}

		if (this.state.redirecting) {
			switch (this.state.redirectTo) {
				case 'viewCampaignLeads':
					return (
						<Redirect push to={ERoutePath.LeadInteractions} />
					);
			}
		}

		return (
			<DataGrid
				data={ this.props.campaigns }
				emptyMessage={ x.descriptions.no_campaigns }
				loading={ this.props.campaigns.fetching }
				onAction={ this.handleAction }
				onExportToCSV={ this.exportCampaignsToCSV }
				onExportToExcel={ this.exportCampaignsToExcel }
				onLimitChange={ this.handleGridLimitChange }
				onOffsetChange={ this.handleGridOffsetChange }
				onOrderChange={ this.handleOrderChange }
				perPageSelectTooltip={ x.tooltips.campaigns_per_page }
				schema={ gridSchema(this.props) }
			/>
		);
	}
}
