__ZN17OZWriteOnBehavior12didAddToNodeEP11OZSceneNode:
0000000000475630	pushq	%rbp
0000000000475631	movq	%rsp, %rbp
0000000000475634	pushq	%r15
0000000000475636	pushq	%r14
0000000000475638	pushq	%r13
000000000047563a	pushq	%r12
000000000047563c	pushq	%rbx
000000000047563d	subq	$0xd8, %rsp
0000000000475644	movq	%rsi, %r14
0000000000475647	movq	%rdi, %rbx
000000000047564a	movq	0x3b0de7(%rip), %rax            ## literal pool symbol address: ___stack_chk_guard
0000000000475651	movq	(%rax), %rax
0000000000475654	movq	%rax, -0x30(%rbp)
0000000000475658	callq	__ZN17OZChannelBehavior12didAddToNodeEP11OZSceneNode ## OZChannelBehavior::didAddToNode(OZSceneNode*)
000000000047565d	testq	%r14, %r14
0000000000475660	je	0x475682
0000000000475662	leaq	__ZTI11OZSceneNode(%rip), %rsi  ## typeinfo for OZSceneNode
0000000000475669	leaq	__ZTI11OZRotoshape(%rip), %rdx  ## typeinfo for OZRotoshape
0000000000475670	movl	$0xc8, %ecx
0000000000475675	movq	%r14, %rdi
0000000000475678	callq	0x6dfd0e                        ## symbol stub for: ___dynamic_cast
000000000047567d	movq	%rax, %r14
0000000000475680	jmp	0x475685
0000000000475682	xorl	%r14d, %r14d
0000000000475685	leaq	0x7110(%r14), %r15
000000000047568c	movl	$0x20, %edi
0000000000475691	callq	0x6dfca2                        ## symbol stub for: __Znwm
0000000000475696	movq	%rax, %r12
0000000000475699	movq	%rax, %rdi
000000000047569c	movq	%rbx, %rsi
000000000047569f	movq	%r15, %rdx
00000000004756a2	callq	__ZN18OZWriteOnCurveNodeC1EP10OZBehaviorP9OZChannel ## OZWriteOnCurveNode::OZWriteOnCurveNode(OZBehavior*, OZChannel*)
00000000004756a7	movq	%r15, %rdi
00000000004756aa	movq	%r12, %rsi
00000000004756ad	callq	0x6df3de                        ## symbol stub for: __ZN9OZChannel25appendCurveProcessingNodeEPv
00000000004756b2	movq	%rbx, %rdi
00000000004756b5	movq	%r12, %rsi
00000000004756b8	callq	__ZN17OZChannelBehavior15didAddCurveNodeEP19OZBehaviorCurveNode ## OZChannelBehavior::didAddCurveNode(OZBehaviorCurveNode*)
00000000004756bd	movq	%rbx, %rdi
00000000004756c0	movq	%r15, %rsi
00000000004756c3	callq	__ZN17OZChannelBehavior18addAffectedChannelEP13OZChannelBase ## OZChannelBehavior::addAffectedChannel(OZChannelBase*)
00000000004756c8	leaq	0x71a8(%r14), %r15
00000000004756cf	movl	$0x20, %edi
00000000004756d4	callq	0x6dfca2                        ## symbol stub for: __Znwm
00000000004756d9	movq	%rax, %r12
00000000004756dc	movq	%rax, %rdi
00000000004756df	movq	%rbx, %rsi
00000000004756e2	movq	%r15, %rdx
00000000004756e5	callq	__ZN18OZWriteOnCurveNodeC1EP10OZBehaviorP9OZChannel ## OZWriteOnCurveNode::OZWriteOnCurveNode(OZBehavior*, OZChannel*)
00000000004756ea	movq	%r15, %rdi
00000000004756ed	movq	%r12, %rsi
00000000004756f0	callq	0x6df3de                        ## symbol stub for: __ZN9OZChannel25appendCurveProcessingNodeEPv
00000000004756f5	movq	%rbx, %rdi
00000000004756f8	movq	%r12, %rsi
00000000004756fb	callq	__ZN17OZChannelBehavior15didAddCurveNodeEP19OZBehaviorCurveNode ## OZChannelBehavior::didAddCurveNode(OZBehaviorCurveNode*)
0000000000475700	movq	%rbx, %rdi
0000000000475703	movq	%r15, %rsi
0000000000475706	callq	__ZN17OZChannelBehavior18addAffectedChannelEP13OZChannelBase ## OZChannelBehavior::addAffectedChannel(OZChannelBase*)
000000000047570b	leaq	0x7378(%r14), %r15
0000000000475712	movl	$0x20, %edi
0000000000475717	callq	0x6dfca2                        ## symbol stub for: __Znwm
000000000047571c	movq	%rax, %r12
000000000047571f	movq	%rax, %rdi
0000000000475722	movq	%rbx, %rsi
0000000000475725	movq	%r15, %rdx
0000000000475728	callq	__ZN18OZWriteOnCurveNodeC1EP10OZBehaviorP9OZChannel ## OZWriteOnCurveNode::OZWriteOnCurveNode(OZBehavior*, OZChannel*)
000000000047572d	movq	%r15, %rdi
0000000000475730	movq	%r12, %rsi
0000000000475733	callq	0x6df3de                        ## symbol stub for: __ZN9OZChannel25appendCurveProcessingNodeEPv
0000000000475738	movq	%rbx, %rdi
000000000047573b	movq	%r12, %rsi
000000000047573e	callq	__ZN17OZChannelBehavior15didAddCurveNodeEP19OZBehaviorCurveNode ## OZChannelBehavior::didAddCurveNode(OZBehaviorCurveNode*)
0000000000475743	movq	%rbx, %rdi
0000000000475746	movq	%r15, %rsi
0000000000475749	callq	__ZN17OZChannelBehavior18addAffectedChannelEP13OZChannelBase ## OZChannelBehavior::addAffectedChannel(OZChannelBase*)
000000000047574e	leaq	0x72e0(%r14), %r15
0000000000475755	movl	$0x20, %edi
000000000047575a	callq	0x6dfca2                        ## symbol stub for: __Znwm
000000000047575f	movq	%rax, %r12
0000000000475762	movq	%rax, %rdi
0000000000475765	movq	%rbx, %rsi
0000000000475768	movq	%r15, %rdx
000000000047576b	callq	__ZN18OZWriteOnCurveNodeC1EP10OZBehaviorP9OZChannel ## OZWriteOnCurveNode::OZWriteOnCurveNode(OZBehavior*, OZChannel*)
0000000000475770	movq	%r15, %rdi
0000000000475773	movq	%r12, %rsi
0000000000475776	callq	0x6df3de                        ## symbol stub for: __ZN9OZChannel25appendCurveProcessingNodeEPv
000000000047577b	movq	%rbx, %rdi
000000000047577e	movq	%r12, %rsi
0000000000475781	callq	__ZN17OZChannelBehavior15didAddCurveNodeEP19OZBehaviorCurveNode ## OZChannelBehavior::didAddCurveNode(OZBehaviorCurveNode*)
0000000000475786	movq	%rbx, %rdi
0000000000475789	movq	%r15, %rsi
000000000047578c	callq	__ZN17OZChannelBehavior18addAffectedChannelEP13OZChannelBase ## OZChannelBehavior::addAffectedChannel(OZChannelBase*)
0000000000475791	movq	(%rbx), %rax
0000000000475794	leaq	-0x60(%rbp), %rdi
0000000000475798	movq	%rbx, %rsi
000000000047579b	callq	*0x268(%rax)
00000000004757a1	leaq	-0xb8(%rbp), %r12
00000000004757a8	movq	-0x50(%rbp), %rax
00000000004757ac	movq	%rax, -0xc0(%rbp)
00000000004757b3	movups	-0x60(%rbp), %xmm0
00000000004757b7	movaps	%xmm0, -0xd0(%rbp)
00000000004757be	movq	-0x38(%rbp), %rax
00000000004757c2	movq	%rax, 0x10(%r12)
00000000004757c7	movups	-0x48(%rbp), %xmm0
00000000004757cb	movups	%xmm0, (%r12)
00000000004757d0	leaq	0x640(%rbx), %r15
00000000004757d7	movq	%r15, %rdi
00000000004757da	callq	0x6df38a                        ## symbol stub for: __ZN9OZChannel20getNumberOfKeyframesEv
00000000004757df	cmpl	$0x1, %eax
00000000004757e2	ja	0x475878
00000000004757e8	movq	%r15, %rdi
00000000004757eb	movl	$0x4, %esi
00000000004757f0	callq	0x6df33c                        ## symbol stub for: __ZN9OZChannel16setInterpolationEj
00000000004757f5	movq	0x3aed14(%rip), %rsi            ## literal pool symbol address: _kCMTimeZero
00000000004757fc	xorps	%xmm0, %xmm0
00000000004757ff	movq	%r15, %rdi
0000000000475802	movl	$0x1, %edx
0000000000475807	callq	0x6df294                        ## symbol stub for: __ZN9OZChannel11setKeyframeERK6CMTimedb
000000000047580c	movq	0x10(%r12), %rax
0000000000475811	movq	%rax, -0x50(%rbp)
0000000000475815	movups	(%r12), %xmm0
000000000047581a	movaps	%xmm0, -0x60(%rbp)
000000000047581e	leaq	-0x98(%rbp), %rdi
0000000000475825	movq	%rbx, %rsi
0000000000475828	callq	__ZNK10OZBehavior16getFrameDurationEv ## OZBehavior::getFrameDuration() const
000000000047582d	movq	-0x88(%rbp), %rax
0000000000475834	movq	%rax, 0x28(%rsp)
0000000000475839	movups	-0x98(%rbp), %xmm0
0000000000475840	movups	%xmm0, 0x18(%rsp)
0000000000475845	movq	-0x50(%rbp), %rax
0000000000475849	movq	%rax, 0x10(%rsp)
000000000047584e	movaps	-0x60(%rbp), %xmm0
0000000000475852	movups	%xmm0, (%rsp)
0000000000475856	leaq	-0x80(%rbp), %rdi
000000000047585a	callq	0x6dcf0c                        ## symbol stub for: _PC_CMTimeSaferSubtract
000000000047585f	leaq	-0x80(%rbp), %rsi
0000000000475863	movsd	0x28fbbd(%rip), %xmm0
000000000047586b	movq	%r15, %rdi
000000000047586e	movl	$0x1, %edx
0000000000475873	callq	0x6df294                        ## symbol stub for: __ZN9OZChannel11setKeyframeERK6CMTimedb
0000000000475878	movq	0x7240(%r14), %rax
000000000047587f	addq	$0x7240, %r14                   ## imm = 0x7240
0000000000475886	movq	%r14, %rdi
0000000000475889	callq	*0x230(%rax)
000000000047588f	testb	%al, %al
0000000000475891	je	0x4759f7
0000000000475897	cmpb	$0x0, 0x808(%rbx)
000000000047589e	jne	0x4759f7
00000000004758a4	movq	(%rbx), %rax
00000000004758a7	movq	%rbx, %rdi
00000000004758aa	callq	*0x150(%rax)
00000000004758b0	testq	%rax, %rax
00000000004758b3	je	0x4759f7
00000000004758b9	movq	%r15, %rdi
00000000004758bc	callq	0x6dfa68                        ## symbol stub for: __ZNK9OZChannel10isDiscreteEv
00000000004758c1	movb	%al, -0x61(%rbp)
00000000004758c4	cmpb	$0x0, -0x61(%rbp)
00000000004758c8	je	0x4758d6
00000000004758ca	movq	%r15, %rdi
00000000004758cd	xorl	%esi, %esi
00000000004758cf	xorl	%edx, %edx
00000000004758d1	callq	0x6df27c                        ## symbol stub for: __ZN9OZChannel11setDiscreteEbb
00000000004758d6	movq	%r15, %rdi
00000000004758d9	xorl	%esi, %esi
00000000004758db	callq	0x6dd8f6                        ## symbol stub for: __ZN13OZChannelBase5resetEb
00000000004758e0	movq	-0xc0(%rbp), %rax
00000000004758e7	movq	%rax, -0x50(%rbp)
00000000004758eb	movaps	-0xd0(%rbp), %xmm0
00000000004758f2	movaps	%xmm0, -0x60(%rbp)
00000000004758f6	leaq	-0x60(%rbp), %rsi
00000000004758fa	movq	%r15, %rdi
00000000004758fd	movq	%r14, %rdx
0000000000475900	callq	0x6df3a8                        ## symbol stub for: __ZN9OZChannel24copyKeyframesFromChannelERK6CMTimeP13OZChannelBase
0000000000475905	movq	0x10(%r12), %rax
000000000047590a	movq	%rax, -0x50(%rbp)
000000000047590e	movups	(%r12), %xmm0
0000000000475913	movaps	%xmm0, -0x60(%rbp)
0000000000475917	movq	(%rbx), %rax
000000000047591a	movq	%rbx, %rdi
000000000047591d	callq	*0x150(%rax)
0000000000475923	addq	$0x90, %rax
0000000000475929	leaq	-0x98(%rbp), %rdi
0000000000475930	movq	%rax, %rsi
0000000000475933	callq	__ZNK15OZSceneSettings16getFrameDurationEv ## OZSceneSettings::getFrameDuration() const
0000000000475938	movq	-0x88(%rbp), %rax
000000000047593f	movq	%rax, 0x28(%rsp)
0000000000475944	movups	-0x98(%rbp), %xmm0
000000000047594b	movups	%xmm0, 0x18(%rsp)
0000000000475950	movq	-0x50(%rbp), %rax
0000000000475954	movq	%rax, 0x10(%rsp)
0000000000475959	movaps	-0x60(%rbp), %xmm0
000000000047595d	movups	%xmm0, (%rsp)
0000000000475961	leaq	-0x80(%rbp), %r13
0000000000475965	movq	%r13, %rdi
0000000000475968	callq	0x6dcf0c                        ## symbol stub for: _PC_CMTimeSaferSubtract
000000000047596d	movq	(%rbx), %rax
0000000000475970	movq	%rbx, %rdi
0000000000475973	callq	*0x150(%rax)
0000000000475979	addq	$0x90, %rax
000000000047597f	leaq	-0x60(%rbp), %r12
0000000000475983	movq	%r12, %rdi
0000000000475986	movq	%rax, %rsi
0000000000475989	callq	__ZNK15OZSceneSettings16getFrameDurationEv ## OZSceneSettings::getFrameDuration() const
000000000047598e	movq	-0x50(%rbp), %rax
0000000000475992	movq	%rax, 0x28(%rsp)
0000000000475997	movups	-0x60(%rbp), %xmm0
000000000047599b	movups	%xmm0, 0x18(%rsp)
00000000004759a0	movq	-0x70(%rbp), %rax
00000000004759a4	movq	%rax, 0x10(%rsp)
00000000004759a9	movups	-0x80(%rbp), %xmm0
00000000004759ad	movups	%xmm0, (%rsp)
00000000004759b1	callq	0x6dcab0                        ## symbol stub for: _CMTimeCompare
00000000004759b6	testl	%eax, %eax
00000000004759b8	cmovsq	%r12, %r13
00000000004759bc	movq	0x10(%r13), %rax
00000000004759c0	movq	%rax, 0x10(%rsp)
00000000004759c5	movups	(%r13), %xmm0
00000000004759ca	movups	%xmm0, (%rsp)
00000000004759ce	callq	0x6dcac2                        ## symbol stub for: _CMTimeGetSeconds
00000000004759d3	movq	0x3aeb36(%rip), %rsi            ## literal pool symbol address: _kCMTimeZero
00000000004759da	movq	%r15, %rdi
00000000004759dd	callq	0x6df2d6                        ## symbol stub for: __ZN9OZChannel14linearTimeWarpEdRK6CMTime
00000000004759e2	cmpb	$0x0, -0x61(%rbp)
00000000004759e6	je	0x4759f7
00000000004759e8	movq	%r15, %rdi
00000000004759eb	movl	$0x1, %esi
00000000004759f0	xorl	%edx, %edx
00000000004759f2	callq	0x6df27c                        ## symbol stub for: __ZN9OZChannel11setDiscreteEbb
00000000004759f7	movq	(%r14), %rax
00000000004759fa	movq	%r14, %rdi
00000000004759fd	callq	*0x230(%rax)
0000000000475a03	testb	%al, %al
0000000000475a05	jne	0x475a25
0000000000475a07	leaq	0x540(%rbx), %r14
0000000000475a0e	movq	0x3aeafb(%rip), %rsi            ## literal pool symbol address: _kCMTimeZero
0000000000475a15	xorps	%xmm0, %xmm0
0000000000475a18	movq	%r14, %rdi
0000000000475a1b	callq	0x6dfa80                        ## symbol stub for: __ZNK9OZChannel13getValueAsIntERK6CMTimed
0000000000475a20	cmpl	$0x9, %eax
0000000000475a23	jne	0x475a8d
0000000000475a25	movaps	0x298824(%rip), %xmm0
0000000000475a2c	movaps	%xmm0, -0x50(%rbp)
0000000000475a30	movaps	0x298809(%rip), %xmm0
0000000000475a37	movaps	%xmm0, -0x60(%rbp)
0000000000475a3b	movl	$0x7, -0x40(%rbp)
0000000000475a42	leaq	0x540(%rbx), %r14
0000000000475a49	leaq	-0x60(%rbp), %rsi
0000000000475a4d	movq	%r14, %rdi
0000000000475a50	movl	$0x9, %edx
0000000000475a55	callq	0x6dd986                        ## symbol stub for: __ZN13OZChannelEnum7setTagsEPKii
0000000000475a5a	leaq	_theApp(%rip), %rax
0000000000475a61	movq	(%rax), %rax
0000000000475a64	movq	0x48(%rax), %rdx
0000000000475a68	leaq	0x42efc1(%rip), %rsi            ## Objc cfstring ref: @"bad cfstring ref"
0000000000475a6f	leaq	-0x80(%rbp), %rdi
0000000000475a73	xorl	%ecx, %ecx
0000000000475a75	callq	0x6df08a                        ## symbol stub for: __ZN8PCStringC1EPK10__CFStringP10__CFBundleS2_
0000000000475a7a	leaq	-0x80(%rbp), %rsi
0000000000475a7e	movq	%r14, %rdi
0000000000475a81	movl	$0x1, %edx
0000000000475a86	callq	0x6dd96e                        ## symbol stub for: __ZN13OZChannelEnum10setStringsERK8PCStringb
0000000000475a8b	jmp	0x475ae5
0000000000475a8d	movaps	0x2987ec(%rip), %xmm0
0000000000475a94	movaps	%xmm0, -0x50(%rbp)
0000000000475a98	movaps	0x2987d1(%rip), %xmm0
0000000000475a9f	movaps	%xmm0, -0x60(%rbp)
0000000000475aa3	leaq	-0x60(%rbp), %rsi
0000000000475aa7	movq	%r14, %rdi
0000000000475aaa	movl	$0x8, %edx
0000000000475aaf	callq	0x6dd986                        ## symbol stub for: __ZN13OZChannelEnum7setTagsEPKii
0000000000475ab4	leaq	_theApp(%rip), %rax
0000000000475abb	movq	(%rax), %rax
0000000000475abe	movq	0x48(%rax), %rdx
0000000000475ac2	leaq	0x42eee7(%rip), %rsi            ## Objc cfstring ref: @"bad cfstring ref"
0000000000475ac9	leaq	-0x80(%rbp), %rdi
0000000000475acd	xorl	%ecx, %ecx
0000000000475acf	callq	0x6df08a                        ## symbol stub for: __ZN8PCStringC1EPK10__CFStringP10__CFBundleS2_
0000000000475ad4	leaq	-0x80(%rbp), %rsi
0000000000475ad8	movq	%r14, %rdi
0000000000475adb	movl	$0x1, %edx
0000000000475ae0	callq	0x6dd96e                        ## symbol stub for: __ZN13OZChannelEnum10setStringsERK8PCStringb
0000000000475ae5	leaq	-0x80(%rbp), %rdi
0000000000475ae9	callq	0x6df0c6                        ## symbol stub for: __ZN8PCStringD1Ev
0000000000475aee	movb	$0x1, 0x808(%rbx)
0000000000475af5	movq	0x3b093c(%rip), %rax            ## literal pool symbol address: ___stack_chk_guard
0000000000475afc	movq	(%rax), %rax
0000000000475aff	cmpq	-0x30(%rbp), %rax
0000000000475b03	jne	0x475b17
0000000000475b05	addq	$0xd8, %rsp
0000000000475b0c	popq	%rbx
0000000000475b0d	popq	%r12
0000000000475b0f	popq	%r13
0000000000475b11	popq	%r14
0000000000475b13	popq	%r15
0000000000475b15	popq	%rbp
0000000000475b16	retq
0000000000475b17	callq	0x6dfd38                        ## symbol stub for: ___stack_chk_fail
0000000000475b1c	jmp	0x475b1e
0000000000475b1e	movq	%rax, %rbx
0000000000475b21	leaq	-0x80(%rbp), %rdi
0000000000475b25	callq	0x6df0c6                        ## symbol stub for: __ZN8PCStringD1Ev
0000000000475b2a	movq	%rbx, %rdi
0000000000475b2d	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
0000000000475b32	jmp	0x475b38
0000000000475b34	jmp	0x475b38
0000000000475b36	jmp	0x475b38
0000000000475b38	movq	%rax, %rbx
0000000000475b3b	movq	%r12, %rdi
0000000000475b3e	callq	0x6dfc36                        ## symbol stub for: __ZdlPv
0000000000475b43	movq	%rbx, %rdi
0000000000475b46	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
0000000000475b4b	movq	%rax, %rdi
0000000000475b4e	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
0000000000475b53	nopw	%cs:(%rax,%rax)
