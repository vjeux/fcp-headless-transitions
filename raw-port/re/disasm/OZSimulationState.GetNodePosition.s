__ZN17OZSimulationState15getNodePositionERK6CMTimeP15OZTransformNodeS4_P9PCVector3IdE:
00000000001ef5b0	pushq	%rbp
00000000001ef5b1	movq	%rsp, %rbp
00000000001ef5b4	pushq	%r15
00000000001ef5b6	pushq	%r14
00000000001ef5b8	pushq	%r12
00000000001ef5ba	pushq	%rbx
00000000001ef5bb	subq	$0x90, %rsp
00000000001ef5c2	movq	%r8, %rbx
00000000001ef5c5	movq	%rcx, %r14
00000000001ef5c8	movq	%rdx, %r15
00000000001ef5cb	movq	%rsi, %r12
00000000001ef5ce	movq	(%rdx), %rax
00000000001ef5d1	movq	%rdx, %rdi
00000000001ef5d4	callq	*0x110(%rax)
00000000001ef5da	leaq	0x90(%rax), %rsi
00000000001ef5e1	leaq	-0x68(%rbp), %rdi
00000000001ef5e5	callq	__ZNK15OZSceneSettings16getFrameDurationEv ## OZSceneSettings::getFrameDuration() const
00000000001ef5ea	movq	0x10(%r12), %rax
00000000001ef5ef	movq	%rax, -0x40(%rbp)
00000000001ef5f3	movups	(%r12), %xmm0
00000000001ef5f8	movaps	%xmm0, -0x50(%rbp)
00000000001ef5fc	movq	-0x58(%rbp), %rax
00000000001ef600	movq	%rax, 0x28(%rsp)
00000000001ef605	movups	-0x68(%rbp), %xmm0
00000000001ef609	movups	%xmm0, 0x18(%rsp)
00000000001ef60e	movq	-0x40(%rbp), %rax
00000000001ef612	movq	%rax, 0x10(%rsp)
00000000001ef617	movaps	-0x50(%rbp), %xmm0
00000000001ef61b	movups	%xmm0, (%rsp)
00000000001ef61f	leaq	-0x80(%rbp), %rdi
00000000001ef623	callq	0x6dced6                        ## symbol stub for: _PC_CMTimeFloorToSampleDuration
00000000001ef628	movq	-0x58(%rbp), %rax
00000000001ef62c	movq	%rax, 0x28(%rsp)
00000000001ef631	movups	-0x68(%rbp), %xmm0
00000000001ef635	movups	%xmm0, 0x18(%rsp)
00000000001ef63a	movq	-0x70(%rbp), %rax
00000000001ef63e	movq	%rax, 0x10(%rsp)
00000000001ef643	movups	-0x80(%rbp), %xmm0
00000000001ef647	movups	%xmm0, (%rsp)
00000000001ef64b	leaq	-0x50(%rbp), %r12
00000000001ef64f	movq	%r12, %rdi
00000000001ef652	callq	0x6dcf0c                        ## symbol stub for: _PC_CMTimeSaferSubtract
00000000001ef657	leaq	0x540(%r15), %rdi
00000000001ef65e	xorps	%xmm0, %xmm0
00000000001ef661	movq	%r12, %rsi
00000000001ef664	callq	0x6dfa9e                        ## symbol stub for: __ZNK9OZChannel16getValueAsDoubleERK6CMTimed
00000000001ef669	movsd	%xmm0, -0x30(%rbp)
00000000001ef66e	leaq	0x5d8(%r15), %rdi
00000000001ef675	xorps	%xmm0, %xmm0
00000000001ef678	movq	%r12, %rsi
00000000001ef67b	callq	0x6dfa9e                        ## symbol stub for: __ZNK9OZChannel16getValueAsDoubleERK6CMTimed
00000000001ef680	movsd	%xmm0, -0x28(%rbp)
00000000001ef685	leaq	0x798(%r15), %rdi
00000000001ef68c	xorps	%xmm0, %xmm0
00000000001ef68f	movq	%r12, %rsi
00000000001ef692	callq	0x6dfa9e                        ## symbol stub for: __ZNK9OZChannel16getValueAsDoubleERK6CMTimed
00000000001ef697	movsd	-0x30(%rbp), %xmm1
00000000001ef69c	movsd	%xmm1, (%rbx)
00000000001ef6a0	movsd	-0x28(%rbp), %xmm1
00000000001ef6a5	movsd	%xmm1, 0x8(%rbx)
00000000001ef6aa	movsd	%xmm0, 0x10(%rbx)
00000000001ef6af	movq	%r12, %rdi
00000000001ef6b2	movq	%r15, %rsi
00000000001ef6b5	movq	%r14, %rdx
00000000001ef6b8	movq	%rbx, %rcx
00000000001ef6bb	callq	__ZN17OZSimulationState16TransformToWorldERK6CMTimeP15OZTransformNodeS4_P9PCVector3IdE ## OZSimulationState::TransformToWorld(CMTime const&, OZTransformNode*, OZTransformNode*, PCVector3<double>*)
00000000001ef6c0	addq	$0x90, %rsp
00000000001ef6c7	popq	%rbx
00000000001ef6c8	popq	%r12
00000000001ef6ca	popq	%r14
00000000001ef6cc	popq	%r15
00000000001ef6ce	popq	%rbp
00000000001ef6cf	retq
