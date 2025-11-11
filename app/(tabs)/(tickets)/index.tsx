import Header from '@/components/reusables/Header';
import Loader from '@/components/reusables/loader';
import { useLocation } from '@/hooks/LocationContext';
import { RootState } from '@/redux/store';
import apiClient from '@/services/api/axiosInstance';
import { updateUserLocation } from '@/services/api/UpdateUserLocation';
import { useAppTheme } from '@/theme/ThemeContext';
import { Typography } from '@/theme/Typography';
import { Ionicons } from '@expo/vector-icons';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  Dimensions,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSelector } from 'react-redux';

import CategorySvg from '../../../assets/svgs/CategorySvg.svg';
import FilterSvg from '../../../assets/svgs/FilterSvg.svg';
import SubjectSvg from '../../../assets/svgs/SubjectSvg.svg';
import VehicleSvg from '../../../assets/svgs/VehicleSvg.svg';

const { width, height } = Dimensions.get('window');

const severityOrder = ['Critical', 'High', 'Medium', 'Low'];

const getSeverityColor = (severity?: string) => {
  switch (severity?.toLowerCase()) {
    case 'critical':
      return '#FF0000';
    case 'high':
      return '#FF5733';
    case 'medium':
      return '#FFA500';
    case 'low':
      return '#4CAF50';
    default:
      return '#9E9E9E';
  }
};

const cleanApiJson = (raw: string) => {
  const splitJson = raw.split('}{');
  return splitJson.length > 1 ? `${splitJson[0]}}` : raw;
};

export default function RequestScreen() {
  const { t } = useTranslation();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useAppTheme(); 
  const [activeTab, setActiveTab] = useState(t('TicketScreen.tabs.new'));
  const [tickets, setTickets] = useState<any[]>([]);
  const [inProgressTickets, setInProgressTickets] = useState<any[]>([]);
  const [closedTickets, setClosedTickets] = useState<any[]>([]);
  const [filterVisible, setFilterVisible] = useState(false);
  const [selectedSeverity, setSelectedSeverity] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const user = useSelector((state: RootState) => state.user);
  const { location, locationName } = useLocation();

  const tabs = [
    t('TicketScreen.tabs.new'),
    t('TicketScreen.tabs.inProgress'),
    t('TicketScreen.tabs.closed'),
  ];

  useFocusEffect(
    useCallback(() => {
      fetchTickets();
      fetchInProgressTickets();
      fetchClosedTickets();
    }, [])
  );

  React.useEffect(() => {
    if (activeTab === t('TicketScreen.tabs.new')) fetchTickets();
    else if (activeTab === t('TicketScreen.tabs.inProgress')) fetchInProgressTickets();
    else if (activeTab === t('TicketScreen.tabs.closed')) fetchClosedTickets();
  }, [activeTab]);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const response = await apiClient.post(
        '/GetOpenTicketList',
        { szAPIKey: user.token, szDeviceType: Platform.OS, UserId: user.id },
        { headers: { 'Content-Type': 'application/json' }, responseType: 'text' }
      );
      const parsed = JSON.parse(cleanApiJson(response.data));
      setTickets(parsed?.CaseOpenList ?? []);
    } catch (error) {
      console.error('Error fetching tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchInProgressTickets = async () => {
    setLoading(true);
    try {
      const response = await apiClient.post(
        '/GetOpenWorkingTicketList',
        { szAPIKey: user.token, szDeviceType: Platform.OS, UserId: user.id },
        { headers: { 'Content-Type': 'application/json' }, responseType: 'text' }
      );
      const parsed = JSON.parse(cleanApiJson(response.data));
      setInProgressTickets(parsed?.CaseOpenWorkingList ?? []);
    } catch (error) {
      console.error('Error fetching in-progress tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchClosedTickets = async () => {
    setLoading(true);
    try {
      const response = await apiClient.post(
        '/GetClosedTicketlists',
        { szAPIKey: user.token, szDeviceType: Platform.OS, UserId: user.id },
        { headers: { 'Content-Type': 'application/json' }, responseType: 'text' }
      );
      const parsed = JSON.parse(cleanApiJson(response.data));
      setClosedTickets(parsed?.TicketClosedList ?? []);
    } catch (error) {
      console.error('Error fetching closed tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const sortTickets = (list: any[]) =>
    [...list].sort((a, b) => severityOrder.indexOf(a.case_severity_desc) - severityOrder.indexOf(b.case_severity_desc));

  let filteredTickets: any[] = activeTab === t('TicketScreen.tabs.new') ? tickets :
                               activeTab === t('TicketScreen.tabs.inProgress') ? inProgressTickets :
                               closedTickets;

  if (selectedSeverity) {
    filteredTickets = filteredTickets.filter(
      (t) => t.case_severity_desc?.toLowerCase() === selectedSeverity.toLowerCase()
    );
  }

  filteredTickets = sortTickets(filteredTickets);

  const handleUpdate = async (ticketId: number) => {
    setLoading(true);
    try {
      const response = await apiClient.post(
        '/UpdateTicketStatus',
        { szAPIKey: user.token, szDeviceType: Platform.OS, UserId: user.id, TicketId: ticketId, statusId: 3, statusReasonId: 13, strRemarks: 'Accept' },
        { headers: { 'Content-Type': 'application/json' }, responseType: 'text' }
      );

      let parsed = JSON.parse(cleanApiJson(response.data));
      if (typeof parsed?.StatusMessage === 'string') parsed.StatusMessage = parsed.StatusMessage.replace(/^"+|"+$/g, '');

      if (parsed?.StatusCode === 200 && parsed?.StatusMessage?.toLowerCase().includes('case updated')) {
        await fetchTickets();
        await fetchInProgressTickets();
        await handleSendLocation();
        return true;
      } else {
        console.warn('Failed to update ticket:', parsed?.StatusMessage);
        return false;
      }
    } catch (error) {
      console.error('Error updating ticket:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleSendLocation = async (loc = location, locName = locationName) => {
    if (!loc) {
      Alert.alert(t('TicketScreen.noLocation'), t('TicketScreen.locationNotFetched'));
      return;
    }
    try {
      await updateUserLocation({
        szAPIKey: user.token,
        szDeviceType: Platform.OS,
        UserId: user.id,
        UserCurrentLocName: locName || 'Unknown',
        Laltitue: loc.latitude.toString(),
        Longitute: loc.longitude.toString(),
        UserStatus: 'Active',
      });
    } catch (err) {
      console.error('Location update failed', err);
      Alert.alert(t('TicketScreen.error'), t('TicketScreen.locationUpdateFailed'));
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.button.primary.bg }}>
      <Header title='Ticket Details' />
      <View
        style={{
          flex: 1,
          backgroundColor: theme.background.section,
          marginTop: 15,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          overflow: 'hidden',
          paddingBottom: tabBarHeight + 20,
        }}
      >
        <ScrollView
          contentContainerStyle={{ paddingBottom: tabBarHeight + 20, paddingHorizontal: width * 0.05 }}
          showsVerticalScrollIndicator={false}
        >
          <Loader visible={loading} />

          {/* Tabs */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabScroll}>
            {tabs.map((tab) => (
              <TouchableOpacity
                key={tab}
                onPress={() => setActiveTab(tab)}
                activeOpacity={0.8}
                style={[
                  styles.tabButton,
                  { borderColor: theme.button.primary.bg, backgroundColor: theme.background.screen },
                  activeTab === tab && { backgroundColor: theme.button.primary.bg },
                ]}
              >
                <Text
                  style={[Typography.bodyDefaultBold, { color: activeTab === tab ? theme.background.screen : theme.button.primary.bg }]}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                >
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Section Title */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginVertical: 10 }}>
            <Text style={[Typography.headingH2Bold, { color: theme.button.primary.bg }]}>{t('TicketScreen.ticketsDetails')}</Text>
            <TouchableOpacity onPress={() => setFilterVisible(true)}>
              <FilterSvg height={24} width={24} color={theme.button.primary.bg} />
            </TouchableOpacity>
          </View>

          {/* Tickets List */}
          {filteredTickets.length === 0 ? (
            <Text style={{ color: theme.text.secondary, textAlign: 'center', marginTop: 20 }}>
              {t('TicketScreen.noTicketsFound')}
            </Text>
          ) : (
            filteredTickets.map((ticket) => {
              const CardContent = (
                <View key={ticket.id} style={[styles.card, { borderColor: theme.button.primary.bg, backgroundColor: theme.background.screen }]}>
                  <View style={styles.cardHeader}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Ionicons name="receipt-outline" size={16} color={theme.button.primary.bg} />
                      <Text style={[Typography.bodyDefaultBold, { color: theme.button.primary.bg }]}> {ticket.TicketNo}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <View style={[styles.dot, { backgroundColor: getSeverityColor(ticket.case_severity_desc) }]} />
                      <Text style={{ color: getSeverityColor(ticket.case_severity_desc), marginLeft: 4 }}>{ticket.case_severity_desc}</Text>
                    </View>
                  </View>

                  <View style={styles.infoRow}>
                    <View style={styles.labelContainer}>
                      <VehicleSvg height={16} width={16} color={theme.button.primary.bg} />
                      <Text style={[Typography.bodySmallRegular, { color: theme.text.secondary }]}>{t('TicketScreen.vehicleNo')}</Text>
                    </View>
                    <Text style={[Typography.bodySmallRegular, { color: theme.text.primary }]}>{ticket.VehicleNo}</Text>
                  </View>

                  <View style={styles.infoRow}>
                    <View style={styles.labelContainer}>
                      <SubjectSvg height={16} width={16} color={theme.button.primary.bg} />
                      <Text style={[Typography.bodySmallRegular, { color: theme.text.secondary }]}>{t('TicketScreen.subject')}</Text>
                    </View>
                    <Text style={[Typography.bodySmallRegular, { color: theme.text.primary }]}>{ticket.case_subject}</Text>
                  </View>

                  <View style={styles.infoRow}>
                    <View style={styles.labelContainer}>
                      <CategorySvg height={16} width={16} color={theme.button.primary.bg} />
                      <Text style={[Typography.bodySmallRegular, { color: theme.text.secondary }]}>{t('TicketScreen.category')}</Text>
                    </View>
                    <Text style={[Typography.bodySmallRegular, { color: theme.text.primary }]}>{ticket.CategoryName}</Text>
                  </View>

                  {activeTab === t('TicketScreen.tabs.new') && (
                    <TouchableOpacity style={[styles.acceptButton, { backgroundColor: theme.button.primary.bg }]} onPress={() => handleUpdate(ticket.id)}>
                      <Text style={[styles.acceptText, { color: theme.background.screen }]}>{t('TicketScreen.accept')}</Text>
                    </TouchableOpacity>
                  )}
                </View>
              );

              if (activeTab !== t('TicketScreen.tabs.new')) {
                return (
                  <TouchableOpacity
                    key={ticket.id}
                    onPress={() =>
                      router.push({
                        pathname: '/TicketDetailsScreen',
                        params: { ticket: JSON.stringify(ticket), tabName: activeTab },
                      })
                    }
                    activeOpacity={0.8}
                  >
                    {CardContent}
                  </TouchableOpacity>
                );
              }

              return <View key={ticket.id}>{CardContent}</View>;
            })
          )}
        </ScrollView>

        {/* Filter Modal */}
        {filterVisible && (
          <View style={[styles.filterModal, { backgroundColor: theme.background.section }]}>
            {severityOrder.map((sev) => (
              <TouchableOpacity
                key={sev}
                style={[styles.filterOption, selectedSeverity === sev && { backgroundColor: theme.button.primary.bg }]}
                onPress={() => {
                  setSelectedSeverity(sev);
                  setFilterVisible(false);
                }}
              >
                <Text style={{ color: selectedSeverity === sev ? theme.background.screen : theme.text.primary, fontWeight: '600' }}>{sev}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={[styles.filterOption, { backgroundColor: theme.background.section }]}
              onPress={() => {
                setSelectedSeverity(null);
                setFilterVisible(false);
              }}
            >
              <Text style={{ color: theme.text.primary }}>{t('TicketScreen.clearFilter')}</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  tabScroll: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: width * 0.03,
    paddingVertical: height * 0.015,
    gap: width * 0.025,
  },
  tabButton: {
    minWidth: width * 0.25,
    maxWidth: width * 0.55,
    borderWidth: 1,
    borderRadius: width * 0.05,
    paddingVertical: height * 0.006,
    paddingHorizontal: width * 0.05,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    padding: width * 0.04,
    borderRadius: 16,
    marginBottom: height * 0.015,
    borderWidth: 1,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: height * 0.01,
  },
  dot: { width: 6, height: 6, borderRadius: 6 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  labelContainer: { flexDirection: 'row', gap: 4 },
  acceptButton: {
    marginTop: 10,
    borderRadius: 20,
    alignItems: 'center',
    paddingVertical: 10,
  },
  acceptText: { fontWeight: '600' },
  filterModal: {
    position: 'absolute',
    top: 80,
    right: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 5,
    padding: 10,
    zIndex: 1000,
  },
  filterOption: { paddingVertical: 8, paddingHorizontal: 12, borderBottomWidth: 1, borderBottomColor: '#ddd' },
});
