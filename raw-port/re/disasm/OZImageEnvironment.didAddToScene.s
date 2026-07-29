__ZN18OZImageEnvironment13didAddToSceneEP7OZScene:
00000000004d5cb0	pushq	%rbp
00000000004d5cb1	movq	%rsp, %rbp
00000000004d5cb4	pushq	%r14
00000000004d5cb6	pushq	%rbx
00000000004d5cb7	subq	$0x160, %rsp                    ## imm = 0x160
00000000004d5cbe	movq	%rsi, %r14
00000000004d5cc1	movq	%rdi, %rbx
00000000004d5cc4	movq	0x34e845(%rip), %rax            ## literal pool symbol address: _kCMTimeZero
00000000004d5ccb	movq	0x10(%rax), %rcx
00000000004d5ccf	movq	%rcx, -0x20(%rbp)
00000000004d5cd3	movups	(%rax), %xmm0
00000000004d5cd6	movaps	%xmm0, -0x30(%rbp)
00000000004d5cda	callq	__ZN15OZTransformNode13didAddToSceneEP7OZScene ## OZTransformNode::didAddToScene(OZScene*)
00000000004d5cdf	testq	%r14, %r14
00000000004d5ce2	je	0x4d5d58
00000000004d5ce4	addq	$0x90, %r14
00000000004d5ceb	leaq	-0x170(%rbp), %rdi
00000000004d5cf2	movq	%r14, %rsi
00000000004d5cf5	callq	__ZN15OZSceneSettingsC1ERKS_    ## OZSceneSettings::OZSceneSettings(OZSceneSettings const&)
00000000004d5cfa	leaq	-0x60(%rbp), %rdi
00000000004d5cfe	movq	%r14, %rsi
00000000004d5d01	callq	__ZNK15OZSceneSettings16getFrameDurationEv ## OZSceneSettings::getFrameDuration() const
00000000004d5d06	movl	-0x160(%rbp), %edx
00000000004d5d0c	leaq	-0x48(%rbp), %rdi
00000000004d5d10	leaq	-0x60(%rbp), %rsi
00000000004d5d14	callq	0x6dfc7e                        ## symbol stub for: __ZmlRK6CMTimej
00000000004d5d19	movq	-0x38(%rbp), %rax
00000000004d5d1d	movq	%rax, -0x20(%rbp)
00000000004d5d21	movups	-0x48(%rbp), %xmm0
00000000004d5d25	movaps	%xmm0, -0x30(%rbp)
00000000004d5d29	leaq	__ZTV15OZSceneSettings(%rip), %rax ## vtable for OZSceneSettings
00000000004d5d30	addq	$0x10, %rax
00000000004d5d34	movq	%rax, -0x170(%rbp)
00000000004d5d3b	leaq	-0xb8(%rbp), %rdi
00000000004d5d42	callq	0x6df0c6                        ## symbol stub for: __ZN8PCStringD1Ev
00000000004d5d47	movq	-0xf0(%rbp), %rdi
00000000004d5d4e	testq	%rdi, %rdi
00000000004d5d51	je	0x4d5d58
00000000004d5d53	callq	0x6dda9a                        ## symbol stub for: __ZN13PCCFRefTraitsIP12CGColorSpaceE7releaseES1_
00000000004d5d58	cmpb	$0x0, 0x4c30(%rbx)
00000000004d5d5f	jne	0x4d5dac
00000000004d5d61	movb	$0x1, 0x4c30(%rbx)
00000000004d5d68	leaq	0x30(%rbx), %rdi
00000000004d5d6c	movq	0xd8(%rbx), %rax
00000000004d5d73	movq	%rax, -0x160(%rbp)
00000000004d5d7a	movups	0xc8(%rbx), %xmm0
00000000004d5d81	movaps	%xmm0, -0x170(%rbp)
00000000004d5d88	movaps	-0x30(%rbp), %xmm0
00000000004d5d8c	movups	%xmm0, -0x158(%rbp)
00000000004d5d93	movq	-0x20(%rbp), %rax
00000000004d5d97	movq	%rax, -0x148(%rbp)
00000000004d5d9e	leaq	-0x170(%rbp), %rsi
00000000004d5da5	xorl	%edx, %edx
00000000004d5da7	callq	0x6de7c0                        ## symbol stub for: __ZN23OZChannelObjectRootBase13setTimeExtentERK11PCTimeRangeb
00000000004d5dac	addq	$0x160, %rsp                    ## imm = 0x160
00000000004d5db3	popq	%rbx
00000000004d5db4	popq	%r14
00000000004d5db6	popq	%rbp
00000000004d5db7	retq
00000000004d5db8	movq	%rax, %rdi
00000000004d5dbb	callq	___clang_call_terminate
00000000004d5dc0	movq	%rax, %rbx
00000000004d5dc3	leaq	-0x170(%rbp), %rdi
00000000004d5dca	callq	__ZN15OZSceneSettingsD1Ev       ## OZSceneSettings::~OZSceneSettings()
00000000004d5dcf	movq	%rbx, %rdi
00000000004d5dd2	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
00000000004d5dd7	nopw	(%rax,%rax)
