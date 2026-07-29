__ZN34FFActiveVAMLBackgroundMattingCacheD1Ev:
00000000006846d0	pushq	%rbp
00000000006846d1	movq	%rsp, %rbp
00000000006846d4	pushq	%rbx
00000000006846d5	pushq	%rax
00000000006846d6	movq	%rdi, %rbx
00000000006846d9	addq	$0x90, %rdi
00000000006846e0	movq	0x98(%rbx), %rsi
00000000006846e7	callq	__ZNSt3__16__treeINS_12__value_typeI5FFMD57PCNSRefIP18PCWeakPointerValueIP21VAMLBackgroundMattingEEEENS_19__map_value_compareIS2_NS_4pairIKS2_S9_EENS_4lessIS2_EELb1EEENS_9allocatorISE_EEE7destroyEPNS_11__tree_nodeISA_PvEE ## std::__1::__tree<std::__1::__value_type<FFMD5, PCNSRef<PCWeakPointerValue<VAMLBackgroundMatting*>*>>, std::__1::__map_value_compare<FFMD5, std::__1::pair<FFMD5 const, PCNSRef<PCWeakPointerValue<VAMLBackgroundMatting*>*>>, std::__1::less<FFMD5>, true>, std::__1::allocator<std::__1::pair<FFMD5 const, PCNSRef<PCWeakPointerValue<VAMLBackgroundMatting*>*>>>>::destroy(std::__1::__tree_node<std::__1::__value_type<FFMD5, PCNSRef<PCWeakPointerValue<VAMLBackgroundMatting*>*>>, void*>*)
00000000006846ec	movq	%rbx, %rdi
00000000006846ef	addq	$0x8, %rsp
00000000006846f3	popq	%rbx
00000000006846f4	popq	%rbp
00000000006846f5	jmp	__ZN16FFSynchronizableD1Ev      ## FFSynchronizable::~FFSynchronizable()
00000000006846fa	nopw	(%rax,%rax)
