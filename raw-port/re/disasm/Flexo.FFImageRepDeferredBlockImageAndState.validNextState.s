__ZN36FFImageRepDeferredBlockImageAndState14validNextStateENS_23DeferredBlockImageStateES0_:
0000000000749560	pushq	%rbp
0000000000749561	movq	%rsp, %rbp
0000000000749564	pushq	%r15
0000000000749566	pushq	%r14
0000000000749568	pushq	%r13
000000000074956a	pushq	%r12
000000000074956c	pushq	%rbx
000000000074956d	subq	$0xd8, %rsp
0000000000749574	movl	%esi, %ebx
0000000000749576	movl	%edi, %r14d
0000000000749579	movq	0x11a4648(%rip), %rax           ## literal pool symbol address: ___stack_chk_guard
0000000000749580	movq	(%rax), %rax
0000000000749583	movq	%rax, -0x30(%rbp)
0000000000749587	movzbl	__ZGVZN36FFImageRepDeferredBlockImageAndState14validNextStateENS_23DeferredBlockImageStateES0_E22sValidStateTransitions(%rip), %eax ## guard variable for FFImageRepDeferredBlockImageAndState::validNextState(FFImageRepDeferredBlockImageAndState::DeferredBlockImageState, FFImageRepDeferredBlockImageAndState::DeferredBlockImageState)::sValidStateTransitions
000000000074958e	testb	%al, %al
0000000000749590	je	0x7496dc
0000000000749596	movq	0x15342cb(%rip), %rax
000000000074959d	testq	%rax, %rax
00000000007495a0	jne	0x7495bc
00000000007495a2	leaq	0x15342bf(%rip), %r13
00000000007495a9	movq	%r13, %r12
00000000007495ac	jmp	0x7495d8
00000000007495ae	nop
00000000007495b0	movq	(%r12), %rax
00000000007495b4	movq	%r12, %r13
00000000007495b7	testq	%rax, %rax
00000000007495ba	je	0x7495d8
00000000007495bc	movq	%rax, %r12
00000000007495bf	movl	0x20(%rax), %eax
00000000007495c2	cmpl	%eax, %r14d
00000000007495c5	jl	0x7495b0
00000000007495c7	jle	0x749633
00000000007495c9	movq	0x8(%r12), %rax
00000000007495ce	testq	%rax, %rax
00000000007495d1	jne	0x7495bc
00000000007495d3	leaq	0x8(%r12), %r13
00000000007495d8	movl	$0x40, %edi
00000000007495dd	callq	0x1497452                       ## symbol stub for: __Znwm
00000000007495e2	movq	%rax, %r15
00000000007495e5	movl	%r14d, 0x20(%rax)
00000000007495e9	addq	$0x30, %rax
00000000007495ed	xorps	%xmm0, %xmm0
00000000007495f0	movups	%xmm0, 0x30(%r15)
00000000007495f5	movq	%rax, 0x28(%r15)
00000000007495f9	movups	%xmm0, (%r15)
00000000007495fd	movq	%r12, 0x10(%r15)
0000000000749601	movq	%r15, (%r13)
0000000000749605	movq	__ZZN36FFImageRepDeferredBlockImageAndState14validNextStateENS_23DeferredBlockImageStateES0_E22sValidStateTransitions(%rip), %rax ## FFImageRepDeferredBlockImageAndState::validNextState(FFImageRepDeferredBlockImageAndState::DeferredBlockImageState, FFImageRepDeferredBlockImageAndState::DeferredBlockImageState)::sValidStateTransitions
000000000074960c	movq	(%rax), %rax
000000000074960f	testq	%rax, %rax
0000000000749612	je	0x74961b
0000000000749614	movq	%rax, __ZZN36FFImageRepDeferredBlockImageAndState14validNextStateENS_23DeferredBlockImageStateES0_E22sValidStateTransitions(%rip) ## FFImageRepDeferredBlockImageAndState::validNextState(FFImageRepDeferredBlockImageAndState::DeferredBlockImageState, FFImageRepDeferredBlockImageAndState::DeferredBlockImageState)::sValidStateTransitions
000000000074961b	movq	0x1534246(%rip), %rdi
0000000000749622	movq	%r15, %rsi
0000000000749625	callq	__ZNSt3__127__tree_balance_after_insertB9nqe210106IPNS_16__tree_node_baseIPvEEEEvT_S5_ ## void std::__1::__tree_balance_after_insert[abi:nqe210106]<std::__1::__tree_node_base<void*>*>(std::__1::__tree_node_base<void*>*, std::__1::__tree_node_base<void*>*)
000000000074962a	incq	0x153423f(%rip)
0000000000749631	jmp	0x749636
0000000000749633	movq	%r12, %r15
0000000000749636	leaq	-0x88(%rbp), %r14
000000000074963d	xorps	%xmm0, %xmm0
0000000000749640	movups	%xmm0, -0x88(%rbp)
0000000000749647	movq	%r14, -0x90(%rbp)
000000000074964e	movq	0x28(%r15), %rsi
0000000000749652	addq	$0x30, %r15
0000000000749656	leaq	-0x90(%rbp), %rdi
000000000074965d	movq	%r15, %rdx
0000000000749660	callq	__ZNSt3__13setI24FFPlayerThreadStateValueNS_4lessIS1_EENS_9allocatorIS1_EEE6insertB9nqe210106INS_21__tree_const_iteratorIS1_PNS_11__tree_nodeIS1_PvEElEEEEvT_SE_ ## void std::__1::set<FFPlayerThreadStateValue, std::__1::less<FFPlayerThreadStateValue>, std::__1::allocator<FFPlayerThreadStateValue>>::insert[abi:nqe210106]<std::__1::__tree_const_iterator<FFPlayerThreadStateValue, std::__1::__tree_node<FFPlayerThreadStateValue, void*>*, long>>(std::__1::__tree_const_iterator<FFPlayerThreadStateValue, std::__1::__tree_node<FFPlayerThreadStateValue, void*>*, long>, std::__1::__tree_const_iterator<FFPlayerThreadStateValue, std::__1::__tree_node<FFPlayerThreadStateValue, void*>*, long>)
0000000000749665	movq	-0x88(%rbp), %rsi
000000000074966c	testq	%rsi, %rsi
000000000074966f	je	0x74969f
0000000000749671	movq	%r14, %rax
0000000000749674	movq	%rsi, %rcx
0000000000749677	nopw	(%rax,%rax)
0000000000749680	xorl	%edx, %edx
0000000000749682	cmpl	%ebx, 0x1c(%rcx)
0000000000749685	setl	%dl
0000000000749688	cmovgeq	%rcx, %rax
000000000074968c	movq	(%rcx,%rdx,8), %rcx
0000000000749690	testq	%rcx, %rcx
0000000000749693	jne	0x749680
0000000000749695	cmpq	%r14, %rax
0000000000749698	je	0x74969f
000000000074969a	cmpl	0x1c(%rax), %ebx
000000000074969d	jge	0x7496a2
000000000074969f	movq	%r14, %rax
00000000007496a2	cmpq	%r14, %rax
00000000007496a5	setne	%bl
00000000007496a8	leaq	-0x90(%rbp), %rdi
00000000007496af	callq	__ZNSt3__16__treeINS_12__value_typeIjP23FFAudioPlayerSourceInfoEENS_19__map_value_compareIjNS_4pairIKjS3_EENS_4lessIjEELb1EEENS_9allocatorIS8_EEE7destroyEPNS_11__tree_nodeIS4_PvEE ## std::__1::__tree<std::__1::__value_type<unsigned int, FFAudioPlayerSourceInfo*>, std::__1::__map_value_compare<unsigned int, std::__1::pair<unsigned int const, FFAudioPlayerSourceInfo*>, std::__1::less<unsigned int>, true>, std::__1::allocator<std::__1::pair<unsigned int const, FFAudioPlayerSourceInfo*>>>::destroy(std::__1::__tree_node<std::__1::__value_type<unsigned int, FFAudioPlayerSourceInfo*>, void*>*)
00000000007496b4	movq	0x11a450d(%rip), %rax           ## literal pool symbol address: ___stack_chk_guard
00000000007496bb	movq	(%rax), %rax
00000000007496be	cmpq	-0x30(%rbp), %rax
00000000007496c2	jne	0x749887
00000000007496c8	movl	%ebx, %eax
00000000007496ca	addq	$0xd8, %rsp
00000000007496d1	popq	%rbx
00000000007496d2	popq	%r12
00000000007496d4	popq	%r13
00000000007496d6	popq	%r14
00000000007496d8	popq	%r15
00000000007496da	popq	%rbp
00000000007496db	retq
00000000007496dc	leaq	__ZGVZN36FFImageRepDeferredBlockImageAndState14validNextStateENS_23DeferredBlockImageStateES0_E22sValidStateTransitions(%rip), %rdi ## guard variable for FFImageRepDeferredBlockImageAndState::validNextState(FFImageRepDeferredBlockImageAndState::DeferredBlockImageState, FFImageRepDeferredBlockImageAndState::DeferredBlockImageState)::sValidStateTransitions
00000000007496e3	callq	0x14974a0                       ## symbol stub for: ___cxa_guard_acquire
00000000007496e8	testl	%eax, %eax
00000000007496ea	je	0x749596
00000000007496f0	movl	$0x0, -0xac(%rbp)
00000000007496fa	movl	$0x1, -0xa8(%rbp)
0000000000749704	leaq	-0xf8(%rbp), %rdi
000000000074970b	leaq	-0xa8(%rbp), %rsi
0000000000749712	leaq	-0x94(%rbp), %rcx
0000000000749719	movl	$0x1, %edx
000000000074971e	callq	__ZNSt3__13setIN36FFImageRepDeferredBlockImageAndState23DeferredBlockImageStateENS_4lessIS2_EENS_9allocatorIS2_EEEC1B9nqe210106ESt16initializer_listIS2_ERKS4_ ## std::__1::set<FFImageRepDeferredBlockImageAndState::DeferredBlockImageState, std::__1::less<FFImageRepDeferredBlockImageAndState::DeferredBlockImageState>, std::__1::allocator<FFImageRepDeferredBlockImageAndState::DeferredBlockImageState>>::set[abi:nqe210106](std::initializer_list<FFImageRepDeferredBlockImageAndState::DeferredBlockImageState>, std::__1::less<FFImageRepDeferredBlockImageAndState::DeferredBlockImageState> const&)
0000000000749723	leaq	-0x90(%rbp), %r15
000000000074972a	leaq	-0xac(%rbp), %rsi
0000000000749731	leaq	-0xf8(%rbp), %rdx
0000000000749738	movq	%r15, %rdi
000000000074973b	callq	__ZNSt3__14pairIKN36FFImageRepDeferredBlockImageAndState23DeferredBlockImageStateENS_3setIS2_NS_4lessIS2_EENS_9allocatorIS2_EEEEEC1B9nqe210106INS_25__check_pair_constructionIS3_S9_EELi0EEERS3_RKS9_ ## std::__1::pair<FFImageRepDeferredBlockImageAndState::DeferredBlockImageState const, std::__1::set<FFImageRepDeferredBlockImageAndState::DeferredBlockImageState, std::__1::less<FFImageRepDeferredBlockImageAndState::DeferredBlockImageState>, std::__1::allocator<FFImageRepDeferredBlockImageAndState::DeferredBlockImageState>>>::pair[abi:nqe210106]<std::__1::__check_pair_construction<FFImageRepDeferredBlockImageAndState::DeferredBlockImageState const, std::__1::set<FFImageRepDeferredBlockImageAndState::DeferredBlockImageState, std::__1::less<FFImageRepDeferredBlockImageAndState::DeferredBlockImageState>, std::__1::allocator<FFImageRepDeferredBlockImageAndState::DeferredBlockImageState>>>, 0>(FFImageRepDeferredBlockImageAndState::DeferredBlockImageState const&, std::__1::set<FFImageRepDeferredBlockImageAndState::DeferredBlockImageState, std::__1::less<FFImageRepDeferredBlockImageAndState::DeferredBlockImageState>, std::__1::allocator<FFImageRepDeferredBlockImageAndState::DeferredBlockImageState>> const&)
0000000000749740	leaq	-0x70(%rbp), %r12
0000000000749744	movl	$0x1, -0xa4(%rbp)
000000000074974e	movl	$0x2, -0xa0(%rbp)
0000000000749758	leaq	-0xe0(%rbp), %rdi
000000000074975f	leaq	-0xa0(%rbp), %rsi
0000000000749766	leaq	-0x93(%rbp), %rcx
000000000074976d	movl	$0x1, %edx
0000000000749772	callq	__ZNSt3__13setIN36FFImageRepDeferredBlockImageAndState23DeferredBlockImageStateENS_4lessIS2_EENS_9allocatorIS2_EEEC1B9nqe210106ESt16initializer_listIS2_ERKS4_ ## std::__1::set<FFImageRepDeferredBlockImageAndState::DeferredBlockImageState, std::__1::less<FFImageRepDeferredBlockImageAndState::DeferredBlockImageState>, std::__1::allocator<FFImageRepDeferredBlockImageAndState::DeferredBlockImageState>>::set[abi:nqe210106](std::initializer_list<FFImageRepDeferredBlockImageAndState::DeferredBlockImageState>, std::__1::less<FFImageRepDeferredBlockImageAndState::DeferredBlockImageState> const&)
0000000000749777	leaq	-0xa4(%rbp), %rsi
000000000074977e	leaq	-0xe0(%rbp), %rdx
0000000000749785	movq	%r12, %rdi
0000000000749788	callq	__ZNSt3__14pairIKN36FFImageRepDeferredBlockImageAndState23DeferredBlockImageStateENS_3setIS2_NS_4lessIS2_EENS_9allocatorIS2_EEEEEC1B9nqe210106INS_25__check_pair_constructionIS3_S9_EELi0EEERS3_RKS9_ ## std::__1::pair<FFImageRepDeferredBlockImageAndState::DeferredBlockImageState const, std::__1::set<FFImageRepDeferredBlockImageAndState::DeferredBlockImageState, std::__1::less<FFImageRepDeferredBlockImageAndState::DeferredBlockImageState>, std::__1::allocator<FFImageRepDeferredBlockImageAndState::DeferredBlockImageState>>>::pair[abi:nqe210106]<std::__1::__check_pair_construction<FFImageRepDeferredBlockImageAndState::DeferredBlockImageState const, std::__1::set<FFImageRepDeferredBlockImageAndState::DeferredBlockImageState, std::__1::less<FFImageRepDeferredBlockImageAndState::DeferredBlockImageState>, std::__1::allocator<FFImageRepDeferredBlockImageAndState::DeferredBlockImageState>>>, 0>(FFImageRepDeferredBlockImageAndState::DeferredBlockImageState const&, std::__1::set<FFImageRepDeferredBlockImageAndState::DeferredBlockImageState, std::__1::less<FFImageRepDeferredBlockImageAndState::DeferredBlockImageState>, std::__1::allocator<FFImageRepDeferredBlockImageAndState::DeferredBlockImageState>> const&)
000000000074978d	leaq	-0x50(%rbp), %r12
0000000000749791	movl	$0x2, -0x9c(%rbp)
000000000074979b	movl	$0x2, -0x98(%rbp)
00000000007497a5	leaq	-0xc8(%rbp), %rdi
00000000007497ac	leaq	-0x98(%rbp), %rsi
00000000007497b3	leaq	-0x92(%rbp), %rcx
00000000007497ba	movl	$0x1, %edx
00000000007497bf	callq	__ZNSt3__13setIN36FFImageRepDeferredBlockImageAndState23DeferredBlockImageStateENS_4lessIS2_EENS_9allocatorIS2_EEEC1B9nqe210106ESt16initializer_listIS2_ERKS4_ ## std::__1::set<FFImageRepDeferredBlockImageAndState::DeferredBlockImageState, std::__1::less<FFImageRepDeferredBlockImageAndState::DeferredBlockImageState>, std::__1::allocator<FFImageRepDeferredBlockImageAndState::DeferredBlockImageState>>::set[abi:nqe210106](std::initializer_list<FFImageRepDeferredBlockImageAndState::DeferredBlockImageState>, std::__1::less<FFImageRepDeferredBlockImageAndState::DeferredBlockImageState> const&)
00000000007497c4	leaq	-0x9c(%rbp), %rsi
00000000007497cb	leaq	-0xc8(%rbp), %rdx
00000000007497d2	movq	%r12, %rdi
00000000007497d5	callq	__ZNSt3__14pairIKN36FFImageRepDeferredBlockImageAndState23DeferredBlockImageStateENS_3setIS2_NS_4lessIS2_EENS_9allocatorIS2_EEEEEC1B9nqe210106INS_25__check_pair_constructionIS3_S9_EELi0EEERS3_RKS9_ ## std::__1::pair<FFImageRepDeferredBlockImageAndState::DeferredBlockImageState const, std::__1::set<FFImageRepDeferredBlockImageAndState::DeferredBlockImageState, std::__1::less<FFImageRepDeferredBlockImageAndState::DeferredBlockImageState>, std::__1::allocator<FFImageRepDeferredBlockImageAndState::DeferredBlockImageState>>>::pair[abi:nqe210106]<std::__1::__check_pair_construction<FFImageRepDeferredBlockImageAndState::DeferredBlockImageState const, std::__1::set<FFImageRepDeferredBlockImageAndState::DeferredBlockImageState, std::__1::less<FFImageRepDeferredBlockImageAndState::DeferredBlockImageState>, std::__1::allocator<FFImageRepDeferredBlockImageAndState::DeferredBlockImageState>>>, 0>(FFImageRepDeferredBlockImageAndState::DeferredBlockImageState const&, std::__1::set<FFImageRepDeferredBlockImageAndState::DeferredBlockImageState, std::__1::less<FFImageRepDeferredBlockImageAndState::DeferredBlockImageState>, std::__1::allocator<FFImageRepDeferredBlockImageAndState::DeferredBlockImageState>> const&)
00000000007497da	leaq	__ZZN36FFImageRepDeferredBlockImageAndState14validNextStateENS_23DeferredBlockImageStateES0_E22sValidStateTransitions(%rip), %rdi ## FFImageRepDeferredBlockImageAndState::validNextState(FFImageRepDeferredBlockImageAndState::DeferredBlockImageState, FFImageRepDeferredBlockImageAndState::DeferredBlockImageState)::sValidStateTransitions
00000000007497e1	leaq	-0x90(%rbp), %rsi
00000000007497e8	leaq	-0x91(%rbp), %rcx
00000000007497ef	movl	$0x3, %edx
00000000007497f4	callq	__ZNSt3__13mapIN36FFImageRepDeferredBlockImageAndState23DeferredBlockImageStateENS_3setIS2_NS_4lessIS2_EENS_9allocatorIS2_EEEES5_NS6_INS_4pairIKS2_S8_EEEEEC1B9nqe210106ESt16initializer_listISB_ERKS5_ ## std::__1::map<FFImageRepDeferredBlockImageAndState::DeferredBlockImageState, std::__1::set<FFImageRepDeferredBlockImageAndState::DeferredBlockImageState, std::__1::less<FFImageRepDeferredBlockImageAndState::DeferredBlockImageState>, std::__1::allocator<FFImageRepDeferredBlockImageAndState::DeferredBlockImageState>>, std::__1::less<FFImageRepDeferredBlockImageAndState::DeferredBlockImageState>, std::__1::allocator<std::__1::pair<FFImageRepDeferredBlockImageAndState::DeferredBlockImageState const, std::__1::set<FFImageRepDeferredBlockImageAndState::DeferredBlockImageState, std::__1::less<FFImageRepDeferredBlockImageAndState::DeferredBlockImageState>, std::__1::allocator<FFImageRepDeferredBlockImageAndState::DeferredBlockImageState>>>>>::map[abi:nqe210106](std::initializer_list<std::__1::pair<FFImageRepDeferredBlockImageAndState::DeferredBlockImageState const, std::__1::set<FFImageRepDeferredBlockImageAndState::DeferredBlockImageState, std::__1::less<FFImageRepDeferredBlockImageAndState::DeferredBlockImageState>, std::__1::allocator<FFImageRepDeferredBlockImageAndState::DeferredBlockImageState>>>>, std::__1::less<FFImageRepDeferredBlockImageAndState::DeferredBlockImageState> const&)
00000000007497f9	leaq	-0x48(%rbp), %rdi
00000000007497fd	movq	-0x40(%rbp), %rsi
0000000000749801	callq	__ZNSt3__16__treeINS_12__value_typeIjP23FFAudioPlayerSourceInfoEENS_19__map_value_compareIjNS_4pairIKjS3_EENS_4lessIjEELb1EEENS_9allocatorIS8_EEE7destroyEPNS_11__tree_nodeIS4_PvEE ## std::__1::__tree<std::__1::__value_type<unsigned int, FFAudioPlayerSourceInfo*>, std::__1::__map_value_compare<unsigned int, std::__1::pair<unsigned int const, FFAudioPlayerSourceInfo*>, std::__1::less<unsigned int>, true>, std::__1::allocator<std::__1::pair<unsigned int const, FFAudioPlayerSourceInfo*>>>::destroy(std::__1::__tree_node<std::__1::__value_type<unsigned int, FFAudioPlayerSourceInfo*>, void*>*)
0000000000749806	leaq	-0x68(%rbp), %rdi
000000000074980a	movq	-0x60(%rbp), %rsi
000000000074980e	callq	__ZNSt3__16__treeINS_12__value_typeIjP23FFAudioPlayerSourceInfoEENS_19__map_value_compareIjNS_4pairIKjS3_EENS_4lessIjEELb1EEENS_9allocatorIS8_EEE7destroyEPNS_11__tree_nodeIS4_PvEE ## std::__1::__tree<std::__1::__value_type<unsigned int, FFAudioPlayerSourceInfo*>, std::__1::__map_value_compare<unsigned int, std::__1::pair<unsigned int const, FFAudioPlayerSourceInfo*>, std::__1::less<unsigned int>, true>, std::__1::allocator<std::__1::pair<unsigned int const, FFAudioPlayerSourceInfo*>>>::destroy(std::__1::__tree_node<std::__1::__value_type<unsigned int, FFAudioPlayerSourceInfo*>, void*>*)
0000000000749813	leaq	-0x88(%rbp), %rdi
000000000074981a	movq	-0x80(%rbp), %rsi
000000000074981e	callq	__ZNSt3__16__treeINS_12__value_typeIjP23FFAudioPlayerSourceInfoEENS_19__map_value_compareIjNS_4pairIKjS3_EENS_4lessIjEELb1EEENS_9allocatorIS8_EEE7destroyEPNS_11__tree_nodeIS4_PvEE ## std::__1::__tree<std::__1::__value_type<unsigned int, FFAudioPlayerSourceInfo*>, std::__1::__map_value_compare<unsigned int, std::__1::pair<unsigned int const, FFAudioPlayerSourceInfo*>, std::__1::less<unsigned int>, true>, std::__1::allocator<std::__1::pair<unsigned int const, FFAudioPlayerSourceInfo*>>>::destroy(std::__1::__tree_node<std::__1::__value_type<unsigned int, FFAudioPlayerSourceInfo*>, void*>*)
0000000000749823	movq	-0xc0(%rbp), %rsi
000000000074982a	leaq	-0xc8(%rbp), %rdi
0000000000749831	callq	__ZNSt3__16__treeINS_12__value_typeIjP23FFAudioPlayerSourceInfoEENS_19__map_value_compareIjNS_4pairIKjS3_EENS_4lessIjEELb1EEENS_9allocatorIS8_EEE7destroyEPNS_11__tree_nodeIS4_PvEE ## std::__1::__tree<std::__1::__value_type<unsigned int, FFAudioPlayerSourceInfo*>, std::__1::__map_value_compare<unsigned int, std::__1::pair<unsigned int const, FFAudioPlayerSourceInfo*>, std::__1::less<unsigned int>, true>, std::__1::allocator<std::__1::pair<unsigned int const, FFAudioPlayerSourceInfo*>>>::destroy(std::__1::__tree_node<std::__1::__value_type<unsigned int, FFAudioPlayerSourceInfo*>, void*>*)
0000000000749836	movq	-0xd8(%rbp), %rsi
000000000074983d	leaq	-0xe0(%rbp), %rdi
0000000000749844	callq	__ZNSt3__16__treeINS_12__value_typeIjP23FFAudioPlayerSourceInfoEENS_19__map_value_compareIjNS_4pairIKjS3_EENS_4lessIjEELb1EEENS_9allocatorIS8_EEE7destroyEPNS_11__tree_nodeIS4_PvEE ## std::__1::__tree<std::__1::__value_type<unsigned int, FFAudioPlayerSourceInfo*>, std::__1::__map_value_compare<unsigned int, std::__1::pair<unsigned int const, FFAudioPlayerSourceInfo*>, std::__1::less<unsigned int>, true>, std::__1::allocator<std::__1::pair<unsigned int const, FFAudioPlayerSourceInfo*>>>::destroy(std::__1::__tree_node<std::__1::__value_type<unsigned int, FFAudioPlayerSourceInfo*>, void*>*)
0000000000749849	movq	-0xf0(%rbp), %rsi
0000000000749850	leaq	-0xf8(%rbp), %rdi
0000000000749857	callq	__ZNSt3__16__treeINS_12__value_typeIjP23FFAudioPlayerSourceInfoEENS_19__map_value_compareIjNS_4pairIKjS3_EENS_4lessIjEELb1EEENS_9allocatorIS8_EEE7destroyEPNS_11__tree_nodeIS4_PvEE ## std::__1::__tree<std::__1::__value_type<unsigned int, FFAudioPlayerSourceInfo*>, std::__1::__map_value_compare<unsigned int, std::__1::pair<unsigned int const, FFAudioPlayerSourceInfo*>, std::__1::less<unsigned int>, true>, std::__1::allocator<std::__1::pair<unsigned int const, FFAudioPlayerSourceInfo*>>>::destroy(std::__1::__tree_node<std::__1::__value_type<unsigned int, FFAudioPlayerSourceInfo*>, void*>*)
000000000074985c	leaq	__ZNSt3__13mapIN36FFImageRepDeferredBlockImageAndState23DeferredBlockImageStateENS_3setIS2_NS_4lessIS2_EENS_9allocatorIS2_EEEES5_NS6_INS_4pairIKS2_S8_EEEEED1B9nqe210106Ev(%rip), %rdi ## std::__1::map<FFImageRepDeferredBlockImageAndState::DeferredBlockImageState, std::__1::set<FFImageRepDeferredBlockImageAndState::DeferredBlockImageState, std::__1::less<FFImageRepDeferredBlockImageAndState::DeferredBlockImageState>, std::__1::allocator<FFImageRepDeferredBlockImageAndState::DeferredBlockImageState>>, std::__1::less<FFImageRepDeferredBlockImageAndState::DeferredBlockImageState>, std::__1::allocator<std::__1::pair<FFImageRepDeferredBlockImageAndState::DeferredBlockImageState const, std::__1::set<FFImageRepDeferredBlockImageAndState::DeferredBlockImageState, std::__1::less<FFImageRepDeferredBlockImageAndState::DeferredBlockImageState>, std::__1::allocator<FFImageRepDeferredBlockImageAndState::DeferredBlockImageState>>>>>::~map[abi:nqe210106]()
0000000000749863	leaq	__ZZN36FFImageRepDeferredBlockImageAndState14validNextStateENS_23DeferredBlockImageStateES0_E22sValidStateTransitions(%rip), %rsi ## FFImageRepDeferredBlockImageAndState::validNextState(FFImageRepDeferredBlockImageAndState::DeferredBlockImageState, FFImageRepDeferredBlockImageAndState::DeferredBlockImageState)::sValidStateTransitions
000000000074986a	leaq	-0x749871(%rip), %rdx
0000000000749871	callq	0x1497482                       ## symbol stub for: ___cxa_atexit
0000000000749876	leaq	__ZGVZN36FFImageRepDeferredBlockImageAndState14validNextStateENS_23DeferredBlockImageStateES0_E22sValidStateTransitions(%rip), %rdi ## guard variable for FFImageRepDeferredBlockImageAndState::validNextState(FFImageRepDeferredBlockImageAndState::DeferredBlockImageState, FFImageRepDeferredBlockImageAndState::DeferredBlockImageState)::sValidStateTransitions
000000000074987d	callq	0x14974a6                       ## symbol stub for: ___cxa_guard_release
0000000000749882	jmp	0x749596
0000000000749887	callq	0x14974f4                       ## symbol stub for: ___stack_chk_fail
000000000074988c	movq	%rax, %rbx
000000000074988f	leaq	-0x48(%rbp), %rdi
0000000000749893	movq	-0x40(%rbp), %rsi
0000000000749897	callq	__ZNSt3__16__treeINS_12__value_typeIjP23FFAudioPlayerSourceInfoEENS_19__map_value_compareIjNS_4pairIKjS3_EENS_4lessIjEELb1EEENS_9allocatorIS8_EEE7destroyEPNS_11__tree_nodeIS4_PvEE ## std::__1::__tree<std::__1::__value_type<unsigned int, FFAudioPlayerSourceInfo*>, std::__1::__map_value_compare<unsigned int, std::__1::pair<unsigned int const, FFAudioPlayerSourceInfo*>, std::__1::less<unsigned int>, true>, std::__1::allocator<std::__1::pair<unsigned int const, FFAudioPlayerSourceInfo*>>>::destroy(std::__1::__tree_node<std::__1::__value_type<unsigned int, FFAudioPlayerSourceInfo*>, void*>*)
000000000074989c	leaq	-0x68(%rbp), %rdi
00000000007498a0	movq	-0x60(%rbp), %rsi
00000000007498a4	callq	__ZNSt3__16__treeINS_12__value_typeIjP23FFAudioPlayerSourceInfoEENS_19__map_value_compareIjNS_4pairIKjS3_EENS_4lessIjEELb1EEENS_9allocatorIS8_EEE7destroyEPNS_11__tree_nodeIS4_PvEE ## std::__1::__tree<std::__1::__value_type<unsigned int, FFAudioPlayerSourceInfo*>, std::__1::__map_value_compare<unsigned int, std::__1::pair<unsigned int const, FFAudioPlayerSourceInfo*>, std::__1::less<unsigned int>, true>, std::__1::allocator<std::__1::pair<unsigned int const, FFAudioPlayerSourceInfo*>>>::destroy(std::__1::__tree_node<std::__1::__value_type<unsigned int, FFAudioPlayerSourceInfo*>, void*>*)
00000000007498a9	leaq	-0x88(%rbp), %rdi
00000000007498b0	movq	-0x80(%rbp), %rsi
00000000007498b4	callq	__ZNSt3__16__treeINS_12__value_typeIjP23FFAudioPlayerSourceInfoEENS_19__map_value_compareIjNS_4pairIKjS3_EENS_4lessIjEELb1EEENS_9allocatorIS8_EEE7destroyEPNS_11__tree_nodeIS4_PvEE ## std::__1::__tree<std::__1::__value_type<unsigned int, FFAudioPlayerSourceInfo*>, std::__1::__map_value_compare<unsigned int, std::__1::pair<unsigned int const, FFAudioPlayerSourceInfo*>, std::__1::less<unsigned int>, true>, std::__1::allocator<std::__1::pair<unsigned int const, FFAudioPlayerSourceInfo*>>>::destroy(std::__1::__tree_node<std::__1::__value_type<unsigned int, FFAudioPlayerSourceInfo*>, void*>*)
00000000007498b9	movb	$0x1, %r14b
00000000007498bc	jmp	0x7498c4
00000000007498be	movq	%rax, %rbx
00000000007498c1	xorl	%r14d, %r14d
00000000007498c4	movq	-0xc0(%rbp), %rsi
00000000007498cb	leaq	-0xc8(%rbp), %rdi
00000000007498d2	callq	__ZNSt3__16__treeINS_12__value_typeIjP23FFAudioPlayerSourceInfoEENS_19__map_value_compareIjNS_4pairIKjS3_EENS_4lessIjEELb1EEENS_9allocatorIS8_EEE7destroyEPNS_11__tree_nodeIS4_PvEE ## std::__1::__tree<std::__1::__value_type<unsigned int, FFAudioPlayerSourceInfo*>, std::__1::__map_value_compare<unsigned int, std::__1::pair<unsigned int const, FFAudioPlayerSourceInfo*>, std::__1::less<unsigned int>, true>, std::__1::allocator<std::__1::pair<unsigned int const, FFAudioPlayerSourceInfo*>>>::destroy(std::__1::__tree_node<std::__1::__value_type<unsigned int, FFAudioPlayerSourceInfo*>, void*>*)
00000000007498d7	jmp	0x7498e1
00000000007498d9	jmp	0x7498db
00000000007498db	movq	%rax, %rbx
00000000007498de	xorl	%r14d, %r14d
00000000007498e1	movq	-0xd8(%rbp), %rsi
00000000007498e8	leaq	-0xe0(%rbp), %rdi
00000000007498ef	callq	__ZNSt3__16__treeINS_12__value_typeIjP23FFAudioPlayerSourceInfoEENS_19__map_value_compareIjNS_4pairIKjS3_EENS_4lessIjEELb1EEENS_9allocatorIS8_EEE7destroyEPNS_11__tree_nodeIS4_PvEE ## std::__1::__tree<std::__1::__value_type<unsigned int, FFAudioPlayerSourceInfo*>, std::__1::__map_value_compare<unsigned int, std::__1::pair<unsigned int const, FFAudioPlayerSourceInfo*>, std::__1::less<unsigned int>, true>, std::__1::allocator<std::__1::pair<unsigned int const, FFAudioPlayerSourceInfo*>>>::destroy(std::__1::__tree_node<std::__1::__value_type<unsigned int, FFAudioPlayerSourceInfo*>, void*>*)
00000000007498f4	jmp	0x749907
00000000007498f6	movq	%rax, %rbx
00000000007498f9	xorl	%r14d, %r14d
00000000007498fc	jmp	0x749907
00000000007498fe	movq	%rax, %rbx
0000000000749901	xorl	%r14d, %r14d
0000000000749904	movq	%r15, %r12
0000000000749907	movq	-0xf0(%rbp), %rsi
000000000074990e	leaq	-0xf8(%rbp), %rdi
0000000000749915	callq	__ZNSt3__16__treeINS_12__value_typeIjP23FFAudioPlayerSourceInfoEENS_19__map_value_compareIjNS_4pairIKjS3_EENS_4lessIjEELb1EEENS_9allocatorIS8_EEE7destroyEPNS_11__tree_nodeIS4_PvEE ## std::__1::__tree<std::__1::__value_type<unsigned int, FFAudioPlayerSourceInfo*>, std::__1::__map_value_compare<unsigned int, std::__1::pair<unsigned int const, FFAudioPlayerSourceInfo*>, std::__1::less<unsigned int>, true>, std::__1::allocator<std::__1::pair<unsigned int const, FFAudioPlayerSourceInfo*>>>::destroy(std::__1::__tree_node<std::__1::__value_type<unsigned int, FFAudioPlayerSourceInfo*>, void*>*)
000000000074991a	cmpq	%r12, %r15
000000000074991d	sete	%al
0000000000749920	orb	%r14b, %al
0000000000749923	jne	0x74994f
0000000000749925	leaq	-0x90(%rbp), %r14
000000000074992c	leaq	-0x20(%r12), %r15
0000000000749931	movq	-0x10(%r12), %rsi
0000000000749936	addq	$-0x18, %r12
000000000074993a	movq	%r12, %rdi
000000000074993d	callq	__ZNSt3__16__treeINS_12__value_typeIjP23FFAudioPlayerSourceInfoEENS_19__map_value_compareIjNS_4pairIKjS3_EENS_4lessIjEELb1EEENS_9allocatorIS8_EEE7destroyEPNS_11__tree_nodeIS4_PvEE ## std::__1::__tree<std::__1::__value_type<unsigned int, FFAudioPlayerSourceInfo*>, std::__1::__map_value_compare<unsigned int, std::__1::pair<unsigned int const, FFAudioPlayerSourceInfo*>, std::__1::less<unsigned int>, true>, std::__1::allocator<std::__1::pair<unsigned int const, FFAudioPlayerSourceInfo*>>>::destroy(std::__1::__tree_node<std::__1::__value_type<unsigned int, FFAudioPlayerSourceInfo*>, void*>*)
0000000000749942	movq	%r15, %r12
0000000000749945	cmpq	%r14, %r15
0000000000749948	jne	0x74992c
000000000074994a	jmp	0x74994f
000000000074994c	movq	%rax, %rbx
000000000074994f	leaq	__ZGVZN36FFImageRepDeferredBlockImageAndState14validNextStateENS_23DeferredBlockImageStateES0_E22sValidStateTransitions(%rip), %rdi ## guard variable for FFImageRepDeferredBlockImageAndState::validNextState(FFImageRepDeferredBlockImageAndState::DeferredBlockImageState, FFImageRepDeferredBlockImageAndState::DeferredBlockImageState)::sValidStateTransitions
0000000000749956	callq	0x149749a                       ## symbol stub for: ___cxa_guard_abort
000000000074995b	movq	%rbx, %rdi
000000000074995e	callq	0x1495d30                       ## symbol stub for: __Unwind_Resume
0000000000749963	movq	%rax, %rdi
0000000000749966	callq	0x1495d30                       ## symbol stub for: __Unwind_Resume
000000000074996b	movq	%rax, %rbx
000000000074996e	movq	-0x88(%rbp), %rsi
0000000000749975	leaq	-0x90(%rbp), %rdi
000000000074997c	callq	__ZNSt3__16__treeINS_12__value_typeIjP23FFAudioPlayerSourceInfoEENS_19__map_value_compareIjNS_4pairIKjS3_EENS_4lessIjEELb1EEENS_9allocatorIS8_EEE7destroyEPNS_11__tree_nodeIS4_PvEE ## std::__1::__tree<std::__1::__value_type<unsigned int, FFAudioPlayerSourceInfo*>, std::__1::__map_value_compare<unsigned int, std::__1::pair<unsigned int const, FFAudioPlayerSourceInfo*>, std::__1::less<unsigned int>, true>, std::__1::allocator<std::__1::pair<unsigned int const, FFAudioPlayerSourceInfo*>>>::destroy(std::__1::__tree_node<std::__1::__value_type<unsigned int, FFAudioPlayerSourceInfo*>, void*>*)
0000000000749981	movq	%rbx, %rdi
0000000000749984	callq	0x1495d30                       ## symbol stub for: __Unwind_Resume
0000000000749989	nopl	(%rax)
