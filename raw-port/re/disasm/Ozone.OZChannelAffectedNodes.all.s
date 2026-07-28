/tmp/Ozone.thin:
__ZN22OZChannelAffectedNodesC2EP9OZFactoryRK8PCStringjP13OZChannelImplP13OZChannelInfo:
000000000001d5c0	pushq	%rbp
000000000001d5c1	movq	%rsp, %rbp
000000000001d5c4	pushq	%r15
000000000001d5c6	pushq	%r14
000000000001d5c8	pushq	%rbx
000000000001d5c9	subq	$0x28, %rsp
000000000001d5cd	movq	%r9, %r15
000000000001d5d0	movq	%r8, %r14
000000000001d5d3	movl	%ecx, %r8d
000000000001d5d6	movq	%rdi, %rbx
000000000001d5d9	movq	%r9, 0x8(%rsp)
000000000001d5de	movq	%r14, (%rsp)
000000000001d5e2	xorl	%ecx, %ecx
000000000001d5e4	xorl	%r9d, %r9d
000000000001d5e7	callq	0x6df474                        ## symbol stub for: __ZN9OZChannelC2EP9OZFactoryRK8PCStringP15OZChannelFolderjjP13OZChannelImplP13OZChannelInfo
000000000001d5ec	leaq	__ZTV22OZChannelAffectedNodes(%rip), %rax ## vtable for OZChannelAffectedNodes
000000000001d5f3	leaq	0x10(%rax), %rcx
000000000001d5f7	movq	%rcx, (%rbx)
000000000001d5fa	addq	$0x370, %rax                    ## imm = 0x370
000000000001d600	movq	%rax, 0x10(%rbx)
000000000001d604	movq	__ZZN22OZChannelAffectedNodes32createOZChannelAffectedNodesInfoEvE32_OZChannelAffectedNodesInfo_once(%rip), %rax ## OZChannelAffectedNodes::createOZChannelAffectedNodesInfo()::_OZChannelAffectedNodesInfo_once
000000000001d60b	cmpq	$-0x1, %rax
000000000001d60f	je	0x1d638
000000000001d611	leaq	-0x19(%rbp), %rax
000000000001d615	movq	%rax, -0x30(%rbp)
000000000001d619	leaq	-0x30(%rbp), %rax
000000000001d61d	movq	%rax, -0x28(%rbp)
000000000001d621	leaq	__ZZN22OZChannelAffectedNodes32createOZChannelAffectedNodesInfoEvE32_OZChannelAffectedNodesInfo_once(%rip), %rdi ## OZChannelAffectedNodes::createOZChannelAffectedNodesInfo()::_OZChannelAffectedNodesInfo_once
000000000001d628	leaq	__ZNSt3__117__call_once_proxyB9nqe210106INS_5tupleIJOZN22OZChannelAffectedNodes32createOZChannelAffectedNodesInfoEvEUlvE_EEEEEvPv(%rip), %rdx ## void std::__1::__call_once_proxy[abi:nqe210106]<std::__1::tuple<OZChannelAffectedNodes::createOZChannelAffectedNodesInfo()::'lambda'()&&>>(void*)
000000000001d62f	leaq	-0x28(%rbp), %rsi
000000000001d633	callq	0x6dfb2e                        ## symbol stub for: __ZNSt3__111__call_onceERVmPvPFvS2_E
000000000001d638	testq	%r15, %r15
000000000001d63b	je	0x1d65a
000000000001d63d	movq	0x88(%rbx), %rax
000000000001d644	movq	%rax, 0x80(%rbx)
000000000001d64b	movq	__ZZN22OZChannelAffectedNodes32createOZChannelAffectedNodesImplEvE32_OZChannelAffectedNodesImpl_once(%rip), %rax ## OZChannelAffectedNodes::createOZChannelAffectedNodesImpl()::_OZChannelAffectedNodesImpl_once
000000000001d652	cmpq	$-0x1, %rax
000000000001d656	jne	0x1d67f
000000000001d658	jmp	0x1d6a6
000000000001d65a	leaq	__ZN22OZChannelAffectedNodes27_OZChannelAffectedNodesInfoE(%rip), %rax ## OZChannelAffectedNodes::_OZChannelAffectedNodesInfo
000000000001d661	movq	(%rax), %rax
000000000001d664	movq	%rax, 0x88(%rbx)
000000000001d66b	movq	%rax, 0x80(%rbx)
000000000001d672	movq	__ZZN22OZChannelAffectedNodes32createOZChannelAffectedNodesImplEvE32_OZChannelAffectedNodesImpl_once(%rip), %rax ## OZChannelAffectedNodes::createOZChannelAffectedNodesImpl()::_OZChannelAffectedNodesImpl_once
000000000001d679	cmpq	$-0x1, %rax
000000000001d67d	je	0x1d6a6
000000000001d67f	leaq	-0x19(%rbp), %rax
000000000001d683	movq	%rax, -0x30(%rbp)
000000000001d687	leaq	-0x30(%rbp), %rax
000000000001d68b	movq	%rax, -0x28(%rbp)
000000000001d68f	leaq	__ZZN22OZChannelAffectedNodes32createOZChannelAffectedNodesImplEvE32_OZChannelAffectedNodesImpl_once(%rip), %rdi ## OZChannelAffectedNodes::createOZChannelAffectedNodesImpl()::_OZChannelAffectedNodesImpl_once
000000000001d696	leaq	__ZNSt3__117__call_once_proxyB9nqe210106INS_5tupleIJOZN22OZChannelAffectedNodes32createOZChannelAffectedNodesImplEvEUlvE_EEEEEvPv(%rip), %rdx ## void std::__1::__call_once_proxy[abi:nqe210106]<std::__1::tuple<OZChannelAffectedNodes::createOZChannelAffectedNodesImpl()::'lambda'()&&>>(void*)
000000000001d69d	leaq	-0x28(%rbp), %rsi
000000000001d6a1	callq	0x6dfb2e                        ## symbol stub for: __ZNSt3__111__call_onceERVmPvPFvS2_E
000000000001d6a6	testq	%r14, %r14
000000000001d6a9	je	0x1d6b1
000000000001d6ab	movq	0x78(%rbx), %rax
000000000001d6af	jmp	0x1d6bf
000000000001d6b1	leaq	__ZN22OZChannelAffectedNodes27_OZChannelAffectedNodesImplE(%rip), %rax ## OZChannelAffectedNodes::_OZChannelAffectedNodesImpl
000000000001d6b8	movq	(%rax), %rax
000000000001d6bb	movq	%rax, 0x78(%rbx)
000000000001d6bf	movq	%rax, 0x70(%rbx)
000000000001d6c3	addq	$0x28, %rsp
000000000001d6c7	popq	%rbx
000000000001d6c8	popq	%r14
000000000001d6ca	popq	%r15
000000000001d6cc	popq	%rbp
000000000001d6cd	retq
000000000001d6ce	movq	%rax, %r14
000000000001d6d1	movq	%rbx, %rdi
000000000001d6d4	callq	0x6df480                        ## symbol stub for: __ZN9OZChannelD2Ev
000000000001d6d9	movq	%r14, %rdi
000000000001d6dc	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
000000000001d6e1	nopw	%cs:(%rax,%rax)
__ZNSt3__117__call_once_proxyB9nqe210106INS_5tupleIJOZN22OZChannelAffectedNodes32createOZChannelAffectedNodesInfoEvEUlvE_EEEEEvPv:
000000000001d6f0	pushq	%rbp
000000000001d6f1	movq	%rsp, %rbp
000000000001d6f4	pushq	%r14
000000000001d6f6	pushq	%rbx
000000000001d6f7	leaq	__ZN22OZChannelAffectedNodes27_OZChannelAffectedNodesInfoE(%rip), %r14 ## OZChannelAffectedNodes::_OZChannelAffectedNodesInfo
000000000001d6fe	cmpq	$0x0, (%r14)
000000000001d702	je	0x1d709
000000000001d704	popq	%rbx
000000000001d705	popq	%r14
000000000001d707	popq	%rbp
000000000001d708	retq
000000000001d709	movl	$0x58, %edi
000000000001d70e	callq	0x6dfca2                        ## symbol stub for: __Znwm
000000000001d713	movq	%rax, %rbx
000000000001d716	leaq	0x7c986b(%rip), %rsi            ## literal pool for: ""
000000000001d71d	movsd	0x6e8553(%rip), %xmm1
000000000001d725	movsd	0x6e7cb3(%rip), %xmm2
000000000001d72d	xorps	%xmm0, %xmm0
000000000001d730	movq	%rax, %rdi
000000000001d733	movaps	%xmm2, %xmm3
000000000001d736	movaps	%xmm2, %xmm4
000000000001d739	callq	0x6dda10                        ## symbol stub for: __ZN13OZChannelInfoC2EdddddPKc
000000000001d73e	movq	%rbx, %rdi
000000000001d741	addq	$0x50, %rdi
000000000001d745	movl	$0x64, %esi
000000000001d74a	callq	0x6dd638                        ## symbol stub for: __ZN11PCSingletonC2Ej
000000000001d74f	leaq	__ZTV26OZChannelAffectedNodesInfo(%rip), %rax ## vtable for OZChannelAffectedNodesInfo
000000000001d756	leaq	0x10(%rax), %rcx
000000000001d75a	movq	%rcx, (%rbx)
000000000001d75d	addq	$0x30, %rax
000000000001d761	movq	%rax, 0x50(%rbx)
000000000001d765	movq	%rbx, (%r14)
000000000001d768	popq	%rbx
000000000001d769	popq	%r14
000000000001d76b	popq	%rbp
000000000001d76c	retq
000000000001d76d	movq	%rax, %r14
000000000001d770	movq	%rbx, %rdi
000000000001d773	callq	0x6dda22                        ## symbol stub for: __ZN13OZChannelInfoD2Ev
000000000001d778	movq	%rbx, %rdi
000000000001d77b	callq	0x6dfc36                        ## symbol stub for: __ZdlPv
000000000001d780	movq	%r14, %rdi
000000000001d783	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
000000000001d788	movq	%rax, %r14
000000000001d78b	movq	%rbx, %rdi

/tmp/Ozone.thin:
__ZN22OZChannelAffectedNodesC2ERK8PCStringP15OZChannelFolderjjP13OZChannelImplP13OZChannelInfo:
000000000020a9f0	pushq	%rbp
000000000020a9f1	movq	%rsp, %rbp
000000000020a9f4	pushq	%r15
000000000020a9f6	pushq	%r14
000000000020a9f8	pushq	%r13
000000000020a9fa	pushq	%r12
000000000020a9fc	pushq	%rbx
000000000020a9fd	subq	$0x38, %rsp
000000000020aa01	movq	%r9, -0x48(%rbp)
000000000020aa05	movl	%r8d, %r15d
000000000020aa08	movl	%ecx, %r12d
000000000020aa0b	movq	%rdx, %r13
000000000020aa0e	movq	%rsi, %r14
000000000020aa11	movq	%rdi, %rbx
000000000020aa14	movq	__ZN30OZChannelAffectedNodes_Factory13_instanceOnceE(%rip), %rax ## OZChannelAffectedNodes_Factory::_instanceOnce
000000000020aa1b	cmpq	$-0x1, %rax
000000000020aa1f	je	0x20aa48
000000000020aa21	leaq	-0x29(%rbp), %rax
000000000020aa25	movq	%rax, -0x40(%rbp)
000000000020aa29	leaq	-0x40(%rbp), %rax
000000000020aa2d	movq	%rax, -0x38(%rbp)
000000000020aa31	leaq	__ZN30OZChannelAffectedNodes_Factory13_instanceOnceE(%rip), %rdi ## OZChannelAffectedNodes_Factory::_instanceOnce
000000000020aa38	leaq	__ZNSt3__117__call_once_proxyB9nqe210106INS_5tupleIJOZN30OZChannelAffectedNodes_Factory11getInstanceEvEUlvE_EEEEEvPv(%rip), %rdx ## void std::__1::__call_once_proxy[abi:nqe210106]<std::__1::tuple<OZChannelAffectedNodes_Factory::getInstance()::'lambda'()&&>>(void*)
000000000020aa3f	leaq	-0x38(%rbp), %rsi
000000000020aa43	callq	0x6dfb2e                        ## symbol stub for: __ZNSt3__111__call_onceERVmPvPFvS2_E
000000000020aa48	movq	__ZN30OZChannelAffectedNodes_Factory9_instanceE(%rip), %rsi ## OZChannelAffectedNodes_Factory::_instance
000000000020aa4f	movq	0x10(%rbp), %rax
000000000020aa53	movq	%rax, 0x8(%rsp)
000000000020aa58	movq	-0x48(%rbp), %rax
000000000020aa5c	movq	%rax, (%rsp)
000000000020aa60	movq	%rbx, %rdi
000000000020aa63	movq	%r14, %rdx
000000000020aa66	movq	%r13, %rcx
000000000020aa69	movl	%r12d, %r8d
000000000020aa6c	movl	%r15d, %r9d
000000000020aa6f	callq	0x6df474                        ## symbol stub for: __ZN9OZChannelC2EP9OZFactoryRK8PCStringP15OZChannelFolderjjP13OZChannelImplP13OZChannelInfo
000000000020aa74	leaq	0x63ba4d(%rip), %rax
000000000020aa7b	movq	%rax, (%rbx)
000000000020aa7e	leaq	0x63bda3(%rip), %rax
000000000020aa85	movq	%rax, 0x10(%rbx)
000000000020aa89	movq	__ZZN22OZChannelAffectedNodes32createOZChannelAffectedNodesInfoEvE32_OZChannelAffectedNodesInfo_once(%rip), %rax ## OZChannelAffectedNodes::createOZChannelAffectedNodesInfo()::_OZChannelAffectedNodesInfo_once
000000000020aa90	cmpq	$-0x1, %rax
000000000020aa94	je	0x20aabd
000000000020aa96	leaq	-0x29(%rbp), %rax
000000000020aa9a	movq	%rax, -0x40(%rbp)
000000000020aa9e	leaq	-0x40(%rbp), %rax
000000000020aaa2	movq	%rax, -0x38(%rbp)
000000000020aaa6	leaq	__ZZN22OZChannelAffectedNodes32createOZChannelAffectedNodesInfoEvE32_OZChannelAffectedNodesInfo_once(%rip), %rdi ## OZChannelAffectedNodes::createOZChannelAffectedNodesInfo()::_OZChannelAffectedNodesInfo_once
000000000020aaad	leaq	__ZNSt3__117__call_once_proxyB9nqe210106INS_5tupleIJOZN22OZChannelAffectedNodes32createOZChannelAffectedNodesInfoEvEUlvE_EEEEEvPv(%rip), %rdx ## void std::__1::__call_once_proxy[abi:nqe210106]<std::__1::tuple<OZChannelAffectedNodes::createOZChannelAffectedNodesInfo()::'lambda'()&&>>(void*)
000000000020aab4	leaq	-0x38(%rbp), %rsi
000000000020aab8	callq	0x6dfb2e                        ## symbol stub for: __ZNSt3__111__call_onceERVmPvPFvS2_E
000000000020aabd	cmpq	$0x0, 0x10(%rbp)
000000000020aac2	je	0x20aae1
000000000020aac4	movq	0x88(%rbx), %rax
000000000020aacb	movq	%rax, 0x80(%rbx)
000000000020aad2	movq	__ZZN22OZChannelAffectedNodes32createOZChannelAffectedNodesImplEvE32_OZChannelAffectedNodesImpl_once(%rip), %rax ## OZChannelAffectedNodes::createOZChannelAffectedNodesImpl()::_OZChannelAffectedNodesImpl_once
000000000020aad9	cmpq	$-0x1, %rax
000000000020aadd	jne	0x20ab03
000000000020aadf	jmp	0x20ab2a
000000000020aae1	movq	__ZN22OZChannelAffectedNodes27_OZChannelAffectedNodesInfoE(%rip), %rax ## OZChannelAffectedNodes::_OZChannelAffectedNodesInfo
000000000020aae8	movq	%rax, 0x88(%rbx)
000000000020aaef	movq	%rax, 0x80(%rbx)
000000000020aaf6	movq	__ZZN22OZChannelAffectedNodes32createOZChannelAffectedNodesImplEvE32_OZChannelAffectedNodesImpl_once(%rip), %rax ## OZChannelAffectedNodes::createOZChannelAffectedNodesImpl()::_OZChannelAffectedNodesImpl_once
000000000020aafd	cmpq	$-0x1, %rax
000000000020ab01	je	0x20ab2a
000000000020ab03	leaq	-0x29(%rbp), %rax
000000000020ab07	movq	%rax, -0x40(%rbp)
000000000020ab0b	leaq	-0x40(%rbp), %rax
000000000020ab0f	movq	%rax, -0x38(%rbp)
000000000020ab13	leaq	__ZZN22OZChannelAffectedNodes32createOZChannelAffectedNodesImplEvE32_OZChannelAffectedNodesImpl_once(%rip), %rdi ## OZChannelAffectedNodes::createOZChannelAffectedNodesImpl()::_OZChannelAffectedNodesImpl_once
000000000020ab1a	leaq	__ZNSt3__117__call_once_proxyB9nqe210106INS_5tupleIJOZN22OZChannelAffectedNodes32createOZChannelAffectedNodesImplEvEUlvE_EEEEEvPv(%rip), %rdx ## void std::__1::__call_once_proxy[abi:nqe210106]<std::__1::tuple<OZChannelAffectedNodes::createOZChannelAffectedNodesImpl()::'lambda'()&&>>(void*)
000000000020ab21	leaq	-0x38(%rbp), %rsi
000000000020ab25	callq	0x6dfb2e                        ## symbol stub for: __ZNSt3__111__call_onceERVmPvPFvS2_E
000000000020ab2a	cmpq	$0x0, -0x48(%rbp)
000000000020ab2f	je	0x20ab37
000000000020ab31	movq	0x78(%rbx), %rax
000000000020ab35	jmp	0x20ab42
000000000020ab37	movq	__ZN22OZChannelAffectedNodes27_OZChannelAffectedNodesImplE(%rip), %rax ## OZChannelAffectedNodes::_OZChannelAffectedNodesImpl
000000000020ab3e	movq	%rax, 0x78(%rbx)
000000000020ab42	movq	%rax, 0x70(%rbx)
000000000020ab46	addq	$0x38, %rsp
000000000020ab4a	popq	%rbx
000000000020ab4b	popq	%r12
000000000020ab4d	popq	%r13
000000000020ab4f	popq	%r14
000000000020ab51	popq	%r15
000000000020ab53	popq	%rbp
000000000020ab54	retq
000000000020ab55	movq	%rax, %r14
000000000020ab58	movq	%rbx, %rdi
000000000020ab5b	callq	0x6df480                        ## symbol stub for: __ZN9OZChannelD2Ev
000000000020ab60	movq	%r14, %rdi
000000000020ab63	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
000000000020ab68	nopl	(%rax,%rax)
__ZNSt3__14listIjNS_9allocatorIjEEE22__insert_with_sentinelB9nqe210106INS_21__list_const_iteratorIjPvEES7_EENS_15__list_iteratorIjS6_EES7_T_T0_:
000000000020ab70	pushq	%rbp
000000000020ab71	movq	%rsp, %rbp
000000000020ab74	pushq	%r15
000000000020ab76	pushq	%r14
000000000020ab78	pushq	%r13
000000000020ab7a	pushq	%r12
000000000020ab7c	pushq	%rbx
000000000020ab7d	subq	$0x18, %rsp
000000000020ab81	cmpq	%rcx, %rdx
000000000020ab84	je	0x20ac00
000000000020ab86	movq	%rcx, %r12
000000000020ab89	movq	%rdx, %r13
000000000020ab8c	movq	%rdi, -0x30(%rbp)
000000000020ab90	movq	%rsi, -0x38(%rbp)
000000000020ab94	movl	$0x18, %edi
000000000020ab99	callq	0x6dfca2                        ## symbol stub for: __Znwm
000000000020ab9e	movq	%rax, %r15
000000000020aba1	xorps	%xmm0, %xmm0
000000000020aba4	movups	%xmm0, (%rax)
000000000020aba7	movl	0x10(%r13), %eax
000000000020abab	movl	%eax, 0x10(%r15)
000000000020abaf	movq	0x8(%r13), %rbx
000000000020abb3	movl	$0x1, %r14d
000000000020abb9	cmpq	%r12, %rbx
000000000020abbc	je	0x20ac05

/tmp/Ozone.thin:
__ZN22OZChannelAffectedNodesD1Ev:
00000000002093f0	pushq	%rbp
00000000002093f1	movq	%rsp, %rbp
00000000002093f4	popq	%rbp
00000000002093f5	jmp	0x6df480                        ## symbol stub for: __ZN9OZChannelD2Ev
00000000002093fa	nopw	(%rax,%rax)
__ZN20OZTransitiveBehaviorC1EP9OZFactoryRK8PCStringj:
0000000000209400	pushq	%rbp
0000000000209401	movq	%rsp, %rbp
0000000000209404	popq	%rbp
0000000000209405	jmp	__ZN20OZTransitiveBehaviorC2EP9OZFactoryRK8PCStringj ## OZTransitiveBehavior::OZTransitiveBehavior(OZFactory*, PCString const&, unsigned int)

/tmp/Ozone.thin:
__ZN22OZChannelAffectedNodesD0Ev:
000000000020a920	pushq	%rbp
000000000020a921	movq	%rsp, %rbp
000000000020a924	pushq	%rbx
000000000020a925	pushq	%rax
000000000020a926	movq	%rdi, %rbx
000000000020a929	callq	0x6df480                        ## symbol stub for: __ZN9OZChannelD2Ev
000000000020a92e	movq	%rbx, %rdi
000000000020a931	addq	$0x8, %rsp
000000000020a935	popq	%rbx
000000000020a936	popq	%rbp
000000000020a937	jmp	0x6dfc36                        ## symbol stub for: __ZdlPv
000000000020a93c	nopl	(%rax)
__ZNK22OZChannelAffectedNodes5cloneEv:
000000000020a940	pushq	%rbp
000000000020a941	movq	%rsp, %rbp

/tmp/Ozone.thin:
__ZNK22OZChannelAffectedNodes5cloneEv:
000000000020a940	pushq	%rbp
000000000020a941	movq	%rsp, %rbp
000000000020a944	pushq	%r14
000000000020a946	pushq	%rbx
000000000020a947	movq	%rdi, %r14
000000000020a94a	movl	$0x98, %edi
000000000020a94f	callq	0x6dfca2                        ## symbol stub for: __Znwm
000000000020a954	movq	%rax, %rbx
000000000020a957	movq	%rax, %rdi
000000000020a95a	movq	%r14, %rsi
000000000020a95d	xorl	%edx, %edx
000000000020a95f	callq	0x6df47a                        ## symbol stub for: __ZN9OZChannelC2ERKS_P15OZChannelFolder
000000000020a964	leaq	0x63bb5d(%rip), %rax
000000000020a96b	movq	%rax, (%rbx)
000000000020a96e	leaq	0x63beb3(%rip), %rax
000000000020a975	movq	%rax, 0x10(%rbx)
000000000020a979	movq	%rbx, %rax
000000000020a97c	popq	%rbx
000000000020a97d	popq	%r14
000000000020a97f	popq	%rbp
000000000020a980	retq
000000000020a981	movq	%rax, %r14
000000000020a984	movq	%rbx, %rdi
000000000020a987	callq	0x6dfc36                        ## symbol stub for: __ZdlPv
000000000020a98c	movq	%r14, %rdi
000000000020a98f	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
000000000020a994	nopw	%cs:(%rax,%rax)
__ZThn16_N22OZChannelAffectedNodesD1Ev:
000000000020a9a0	pushq	%rbp
000000000020a9a1	movq	%rsp, %rbp

/tmp/Ozone.thin:
__ZN22OZChannelAffectedNodes18getObjCWrapperNameEv:
00000000002091d0	pushq	%rbp
00000000002091d1	movq	%rsp, %rbp
00000000002091d4	leaq	0x68e255(%rip), %rax            ## Objc cfstring ref: @"bad cfstring ref"
00000000002091db	popq	%rbp
00000000002091dc	retq
00000000002091dd	nopl	(%rax)
__ZN20OZTransitiveBehaviorC2EP9OZFactoryRK8PCStringj:
00000000002091e0	pushq	%rbp
00000000002091e1	movq	%rsp, %rbp
00000000002091e4	pushq	%r15
