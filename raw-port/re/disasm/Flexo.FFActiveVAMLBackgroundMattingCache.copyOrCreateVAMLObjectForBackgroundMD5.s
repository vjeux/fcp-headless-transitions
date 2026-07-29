__ZN34FFActiveVAMLBackgroundMattingCache38copyOrCreateVAMLObjectForBackgroundMD5ERK5FFMD5PvPb:
0000000000684a10	pushq	%rbp
0000000000684a11	movq	%rsp, %rbp
0000000000684a14	pushq	%r15
0000000000684a16	pushq	%r14
0000000000684a18	pushq	%r13
0000000000684a1a	pushq	%r12
0000000000684a1c	pushq	%rbx
0000000000684a1d	subq	$0x48, %rsp
0000000000684a21	movq	%r8, %r13
0000000000684a24	movq	%rdx, %r12
0000000000684a27	movq	%rsi, %r14
0000000000684a2a	movq	%rdi, %rbx
0000000000684a2d	leaq	-0x58(%rbp), %rdi
0000000000684a31	callq	0x14965f4                       ## symbol stub for: __ZN17PCAutoreleasePoolC1Ev
0000000000684a36	movq	%r14, -0x70(%rbp)
0000000000684a3a	movb	$0x0, -0x68(%rbp)
0000000000684a3e	movq	%r14, %rdi
0000000000684a41	callq	__ZN16FFSynchronizable4LockEv   ## FFSynchronizable::Lock()
0000000000684a46	movq	%rbx, -0x38(%rbp)
0000000000684a4a	movq	$0x0, (%rbx)
0000000000684a51	movb	$0x0, (%r13)
0000000000684a56	leaq	0x90(%r14), %rdi
0000000000684a5d	movq	%rdi, -0x60(%rbp)
0000000000684a61	movq	%r12, %rsi
0000000000684a64	callq	__ZNSt3__16__treeINS_12__value_typeI5FFMD57PCNSRefIP18PCWeakPointerValueIP21VAMLBackgroundMattingEEEENS_19__map_value_compareIS2_NS_4pairIKS2_S9_EENS_4lessIS2_EELb1EEENS_9allocatorISE_EEE4findIS2_EENS_15__tree_iteratorISA_PNS_11__tree_nodeISA_PvEElEERKT_ ## std::__1::__tree_iterator<std::__1::__value_type<FFMD5, PCNSRef<PCWeakPointerValue<VAMLBackgroundMatting*>*>>, std::__1::__tree_node<std::__1::__value_type<FFMD5, PCNSRef<PCWeakPointerValue<VAMLBackgroundMatting*>*>>, void*>*, long> std::__1::__tree<std::__1::__value_type<FFMD5, PCNSRef<PCWeakPointerValue<VAMLBackgroundMatting*>*>>, std::__1::__map_value_compare<FFMD5, std::__1::pair<FFMD5 const, PCNSRef<PCWeakPointerValue<VAMLBackgroundMatting*>*>>, std::__1::less<FFMD5>, true>, std::__1::allocator<std::__1::pair<FFMD5 const, PCNSRef<PCWeakPointerValue<VAMLBackgroundMatting*>*>>>>::find<FFMD5>(FFMD5 const&)
0000000000684a69	leaq	0x98(%r14), %rcx
0000000000684a70	cmpq	%rcx, %rax
0000000000684a73	je	0x684aea
0000000000684a75	movq	0x30(%rax), %rbx
0000000000684a79	movq	0x1535230(%rip), %r15
0000000000684a80	movq	%rbx, %rdi
0000000000684a83	movq	%r15, %rsi
0000000000684a86	callq	*0x1268c34(%rip)                ## Objc message: -[%rdi skipFcpTrackerResultSmoothing]
0000000000684a8c	testq	%rax, %rax
0000000000684a8f	je	0x684aea
0000000000684a91	movq	%r12, -0x50(%rbp)
0000000000684a95	leaq	_OBJC_CLASS_$_FFBGMD5AndBGMatting(%rip), %rdi
0000000000684a9c	callq	0x14978fc                       ## symbol stub for: _objc_alloc
0000000000684aa1	movq	%rax, %r12
0000000000684aa4	movq	%rbx, %rdi
0000000000684aa7	movq	%r15, %rsi
0000000000684aaa	callq	*0x1268c10(%rip)                ## Objc message: -[%rdi skipFcpTrackerResultSmoothing]
0000000000684ab0	movq	0x1551861(%rip), %rsi
0000000000684ab7	movq	%r12, %rdi
0000000000684aba	movq	-0x50(%rbp), %rdx
0000000000684abe	movq	%rax, %rcx
0000000000684ac1	callq	*0x1268bf9(%rip)                ## Objc message: -[%rdi skipFcpTrackerResultSmoothing]
0000000000684ac7	movq	%rax, -0x30(%rbp)
0000000000684acb	leaq	-0x30(%rbp), %rsi
0000000000684acf	movq	-0x38(%rbp), %rdi
0000000000684ad3	callq	0x149611a                       ## symbol stub for: __ZN12ProCore_Impl11PCNSRefImplaSEOS0_
0000000000684ad8	leaq	-0x30(%rbp), %rdi
0000000000684adc	callq	0x1496f96                       ## symbol stub for: __ZNK12ProCore_Impl11PCNSRefImpl7releaseEv
0000000000684ae1	movq	-0x50(%rbp), %r12
0000000000684ae5	movb	$0x1, (%r13)
0000000000684aea	movq	-0x38(%rbp), %rax
0000000000684aee	cmpq	$0x0, (%rax)
0000000000684af2	jne	0x684bfe
0000000000684af8	movq	0x12629e1(%rip), %rdi           ## literal pool symbol address: _OBJC_CLASS_$_VAMLBackgroundMatting
0000000000684aff	callq	0x1497908                       ## symbol stub for: _objc_alloc_init
0000000000684b04	movq	%rax, -0x40(%rbp)
0000000000684b08	movq	0x12661d9(%rip), %rdi           ## literal pool symbol address: _OBJC_CLASS_$_PCWeakPointerValue
0000000000684b0f	callq	0x14978fc                       ## symbol stub for: _objc_alloc
0000000000684b14	movq	-0x60(%rbp), %r15
0000000000684b18	movq	-0x40(%rbp), %rdx
0000000000684b1c	movq	0x1534215(%rip), %rsi
0000000000684b23	movq	%rax, %rdi
0000000000684b26	callq	*0x1268b94(%rip)                ## Objc message: -[%rdi skipFcpTrackerResultSmoothing]
0000000000684b2c	movq	%rax, -0x48(%rbp)
0000000000684b30	leaq	-0x30(%rbp), %rsi
0000000000684b34	movq	%r15, %rdi
0000000000684b37	movq	%r12, %rdx
0000000000684b3a	callq	__ZNSt3__16__treeINS_12__value_typeI5FFMD57PCNSRefIP18PCWeakPointerValueIP21VAMLBackgroundMattingEEEENS_19__map_value_compareIS2_NS_4pairIKS2_S9_EENS_4lessIS2_EELb1EEENS_9allocatorISE_EEE12__find_equalIS2_EERPNS_16__tree_node_baseIPvEERPNS_15__tree_end_nodeISP_EERKT_ ## std::__1::__tree_node_base<void*>*& std::__1::__tree<std::__1::__value_type<FFMD5, PCNSRef<PCWeakPointerValue<VAMLBackgroundMatting*>*>>, std::__1::__map_value_compare<FFMD5, std::__1::pair<FFMD5 const, PCNSRef<PCWeakPointerValue<VAMLBackgroundMatting*>*>>, std::__1::less<FFMD5>, true>, std::__1::allocator<std::__1::pair<FFMD5 const, PCNSRef<PCWeakPointerValue<VAMLBackgroundMatting*>*>>>>::__find_equal<FFMD5>(std::__1::__tree_end_node<std::__1::__tree_node_base<void*>*>*&, FFMD5 const&)
0000000000684b3f	movq	%rax, %rbx
0000000000684b42	movq	(%rax), %r13
0000000000684b45	testq	%r13, %r13
0000000000684b48	jne	0x684b9f
0000000000684b4a	movl	$0x38, %edi
0000000000684b4f	callq	0x1497452                       ## symbol stub for: __Znwm
0000000000684b54	movq	%rax, %r13
0000000000684b57	movups	(%r12), %xmm0
0000000000684b5c	movups	%xmm0, 0x20(%rax)
0000000000684b60	movq	$0x0, 0x30(%rax)
0000000000684b68	movq	-0x30(%rbp), %rax
0000000000684b6c	xorps	%xmm0, %xmm0
0000000000684b6f	movups	%xmm0, (%r13)
0000000000684b74	movq	%rax, 0x10(%r13)
0000000000684b78	movq	%r13, (%rbx)
0000000000684b7b	movq	(%r15), %rax
0000000000684b7e	movq	(%rax), %rax
0000000000684b81	testq	%rax, %rax
0000000000684b84	je	0x684b89
0000000000684b86	movq	%rax, (%r15)
0000000000684b89	movq	0x98(%r14), %rdi
0000000000684b90	movq	%r13, %rsi
0000000000684b93	callq	__ZNSt3__127__tree_balance_after_insertB9nqe210106IPNS_16__tree_node_baseIPvEEEEvT_S5_ ## void std::__1::__tree_balance_after_insert[abi:nqe210106]<std::__1::__tree_node_base<void*>*>(std::__1::__tree_node_base<void*>*, std::__1::__tree_node_base<void*>*)
0000000000684b98	incq	0xa0(%r14)
0000000000684b9f	addq	$0x30, %r13
0000000000684ba3	leaq	-0x48(%rbp), %rsi
0000000000684ba7	movq	%r13, %rdi
0000000000684baa	callq	0x149611a                       ## symbol stub for: __ZN12ProCore_Impl11PCNSRefImplaSEOS0_
0000000000684baf	leaq	-0x48(%rbp), %rdi
0000000000684bb3	callq	0x1496f96                       ## symbol stub for: __ZNK12ProCore_Impl11PCNSRefImpl7releaseEv
0000000000684bb8	leaq	_OBJC_CLASS_$_FFBGMD5AndBGMatting(%rip), %rdi
0000000000684bbf	callq	0x14978fc                       ## symbol stub for: _objc_alloc
0000000000684bc4	movq	-0x40(%rbp), %rcx
0000000000684bc8	movq	0x1551749(%rip), %rsi
0000000000684bcf	movq	%rax, %rdi
0000000000684bd2	movq	%r12, %rdx
0000000000684bd5	callq	*0x1268ae5(%rip)                ## Objc message: -[%rdi skipFcpTrackerResultSmoothing]
0000000000684bdb	movq	%rax, -0x30(%rbp)
0000000000684bdf	leaq	-0x30(%rbp), %rsi
0000000000684be3	movq	-0x38(%rbp), %rdi
0000000000684be7	callq	0x149611a                       ## symbol stub for: __ZN12ProCore_Impl11PCNSRefImplaSEOS0_
0000000000684bec	leaq	-0x30(%rbp), %rdi
0000000000684bf0	callq	0x1496f96                       ## symbol stub for: __ZNK12ProCore_Impl11PCNSRefImpl7releaseEv
0000000000684bf5	leaq	-0x40(%rbp), %rdi
0000000000684bf9	callq	0x1496f96                       ## symbol stub for: __ZNK12ProCore_Impl11PCNSRefImpl7releaseEv
0000000000684bfe	cmpq	$0x2, 0xa0(%r14)
0000000000684c06	jb	0x684c31
0000000000684c08	movl	0xa8(%r14), %eax
0000000000684c0f	leal	0x1(%rax), %ecx
0000000000684c12	movl	%ecx, 0xa8(%r14)
0000000000684c19	cmpl	$0x64, %eax
0000000000684c1c	jl	0x684c31
0000000000684c1e	movq	%r14, %rdi
0000000000684c21	callq	__ZN34FFActiveVAMLBackgroundMattingCache21CleanupZeroedWeakRefsEv ## FFActiveVAMLBackgroundMattingCache::CleanupZeroedWeakRefs()
0000000000684c26	movl	$0x0, 0xa8(%r14)
0000000000684c31	movq	-0x70(%rbp), %rdi
0000000000684c35	callq	__ZN16FFSynchronizable6UnlockEv ## FFSynchronizable::Unlock()
0000000000684c3a	leaq	-0x58(%rbp), %rdi
0000000000684c3e	callq	0x14965fa                       ## symbol stub for: __ZN17PCAutoreleasePoolD1Ev
0000000000684c43	movq	-0x38(%rbp), %rax
0000000000684c47	addq	$0x48, %rsp
0000000000684c4b	popq	%rbx
0000000000684c4c	popq	%r12
0000000000684c4e	popq	%r13
0000000000684c50	popq	%r14
0000000000684c52	popq	%r15
0000000000684c54	popq	%rbp
0000000000684c55	retq
0000000000684c56	movq	%rax, %rdi
0000000000684c59	callq	___clang_call_terminate
0000000000684c5e	movq	%rax, %rdi
0000000000684c61	callq	___clang_call_terminate
0000000000684c66	movq	%rax, %r14
0000000000684c69	leaq	-0x30(%rbp), %rdi
0000000000684c6d	callq	0x1496f96                       ## symbol stub for: __ZNK12ProCore_Impl11PCNSRefImpl7releaseEv
0000000000684c72	jmp	0x684cb9
0000000000684c74	movq	%rax, %rdi
0000000000684c77	callq	___clang_call_terminate
0000000000684c7c	movq	%rax, %rdi
0000000000684c7f	callq	___clang_call_terminate
0000000000684c84	jmp	0x684cf2
0000000000684c86	movq	%rax, %rdi
0000000000684c89	callq	___clang_call_terminate
0000000000684c8e	movq	%rax, %r14
0000000000684c91	leaq	-0x30(%rbp), %rdi
0000000000684c95	callq	0x1496f96                       ## symbol stub for: __ZNK12ProCore_Impl11PCNSRefImpl7releaseEv
0000000000684c9a	jmp	0x684cf5
0000000000684c9c	movq	%rax, %rdi
0000000000684c9f	callq	___clang_call_terminate
0000000000684ca4	jmp	0x684cf2
0000000000684ca6	jmp	0x684ca8
0000000000684ca8	movq	%rax, %r14
0000000000684cab	jmp	0x684cb9
0000000000684cad	movq	%rax, %r14
0000000000684cb0	leaq	-0x48(%rbp), %rdi
0000000000684cb4	callq	0x1496f96                       ## symbol stub for: __ZNK12ProCore_Impl11PCNSRefImpl7releaseEv
0000000000684cb9	leaq	-0x40(%rbp), %rdi
0000000000684cbd	callq	0x1496f96                       ## symbol stub for: __ZNK12ProCore_Impl11PCNSRefImpl7releaseEv
0000000000684cc2	jmp	0x684cf5
0000000000684cc4	movq	%rax, %rdi
0000000000684cc7	callq	___clang_call_terminate
0000000000684ccc	movq	%rax, %rdi
0000000000684ccf	callq	___clang_call_terminate
0000000000684cd4	movq	%rax, %r14
0000000000684cd7	leaq	-0x58(%rbp), %rdi
0000000000684cdb	callq	0x14965fa                       ## symbol stub for: __ZN17PCAutoreleasePoolD1Ev
0000000000684ce0	movq	%r14, %rdi
0000000000684ce3	callq	0x1495d30                       ## symbol stub for: __Unwind_Resume
0000000000684ce8	movq	%rax, %rdi
0000000000684ceb	callq	___clang_call_terminate
0000000000684cf0	jmp	0x684cf2
0000000000684cf2	movq	%rax, %r14
0000000000684cf5	movq	-0x38(%rbp), %rdi
0000000000684cf9	callq	0x1496f96                       ## symbol stub for: __ZNK12ProCore_Impl11PCNSRefImpl7releaseEv
0000000000684cfe	leaq	-0x70(%rbp), %rdi
0000000000684d02	callq	__ZN14FFSynchronizerD1Ev        ## FFSynchronizer::~FFSynchronizer()
0000000000684d07	leaq	-0x58(%rbp), %rdi
0000000000684d0b	callq	0x14965fa                       ## symbol stub for: __ZN17PCAutoreleasePoolD1Ev
0000000000684d10	movq	%r14, %rdi
0000000000684d13	callq	0x1495d30                       ## symbol stub for: __Unwind_Resume
0000000000684d18	movq	%rax, %rdi
0000000000684d1b	callq	___clang_call_terminate
