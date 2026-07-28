__ZN21OZMotionPathCurveNode17getPositionOnPathERK6CMTimeS2_d:
000000000040b470	pushq	%rbp
000000000040b471	movq	%rsp, %rbp
000000000040b474	pushq	%r15
000000000040b476	pushq	%r14
000000000040b478	pushq	%r13
000000000040b47a	pushq	%r12
000000000040b47c	pushq	%rbx
000000000040b47d	subq	$0x1a8, %rsp                    ## imm = 0x1A8
000000000040b484	movsd	%xmm0, -0x168(%rbp)
000000000040b48c	movq	%rdx, %r13
000000000040b48f	movq	%rsi, -0xc0(%rbp)
000000000040b496	movq	0x419073(%rip), %rax            ## literal pool symbol address: _kCMTimeZero
000000000040b49d	movq	0x10(%rax), %rcx
000000000040b4a1	movq	%rcx, -0x120(%rbp)
000000000040b4a8	movupd	(%rax), %xmm0
000000000040b4ac	movapd	%xmm0, -0x130(%rbp)
000000000040b4b4	movq	$0x0, -0x48(%rbp)
000000000040b4bc	movq	%rdi, -0x90(%rbp)
000000000040b4c3	movq	0x8(%rdi), %rdi
000000000040b4c7	testq	%rdi, %rdi
000000000040b4ca	je	0x40b4e6
000000000040b4cc	leaq	__ZTI10OZBehavior(%rip), %rsi   ## typeinfo for OZBehavior
000000000040b4d3	leaq	__ZTI20OZMotionPathBehavior(%rip), %rdx ## typeinfo for OZMotionPathBehavior
000000000040b4da	xorl	%ecx, %ecx
000000000040b4dc	callq	0x6dfd0e                        ## symbol stub for: ___dynamic_cast
000000000040b4e1	movq	%rax, %r12
000000000040b4e4	jmp	0x40b4e9
000000000040b4e6	xorl	%r12d, %r12d
000000000040b4e9	leaq	0x1ae8(%r12), %rdi
000000000040b4f1	movq	0x419018(%rip), %rbx            ## literal pool symbol address: _kCMTimeZero
000000000040b4f8	xorpd	%xmm0, %xmm0
000000000040b4fc	movq	%rbx, %rsi
000000000040b4ff	callq	0x6dfa80                        ## symbol stub for: __ZNK9OZChannel13getValueAsIntERK6CMTimed
000000000040b504	movl	%eax, %r15d
000000000040b507	leaq	0x1950(%r12), %rdi
000000000040b50f	xorpd	%xmm0, %xmm0
000000000040b513	movq	%rbx, %rsi
000000000040b516	callq	0x6dfa80                        ## symbol stub for: __ZNK9OZChannel13getValueAsIntERK6CMTimed
000000000040b51b	movl	%eax, %r14d
000000000040b51e	leaq	0x1be8(%r12), %rdi
000000000040b526	xorpd	%xmm0, %xmm0
000000000040b52a	movq	%rbx, %rsi
000000000040b52d	callq	0x6dfa80                        ## symbol stub for: __ZNK9OZChannel13getValueAsIntERK6CMTimed
000000000040b532	movl	%eax, -0xa8(%rbp)
000000000040b538	movq	(%r12), %rax
000000000040b53c	leaq	-0x198(%rbp), %rdi
000000000040b543	movq	%r12, %rsi
000000000040b546	callq	*0x268(%rax)
000000000040b54c	movq	%r14, -0xa0(%rbp)
000000000040b553	cmpl	$0x7, %r14d
000000000040b557	jne	0x40b578
000000000040b559	addq	$0x1a50, %r12                   ## imm = 0x1A50
000000000040b560	xorpd	%xmm0, %xmm0
000000000040b564	movq	%r12, %rdi
000000000040b567	movq	-0xc0(%rbp), %rsi
000000000040b56e	callq	0x6dfa9e                        ## symbol stub for: __ZNK9OZChannel16getValueAsDoubleERK6CMTimed
000000000040b573	jmp	0x40bfac
000000000040b578	movq	0x10(%rbx), %rax
000000000040b57c	movq	%rax, -0x70(%rbp)
000000000040b580	movups	(%rbx), %xmm0
000000000040b583	movaps	%xmm0, -0x80(%rbp)
000000000040b587	movq	%rax, -0x50(%rbp)
000000000040b58b	movaps	%xmm0, -0x60(%rbp)
000000000040b58f	movq	0x10(%r13), %rax
000000000040b593	movq	%rax, -0x140(%rbp)
000000000040b59a	movups	(%r13), %xmm0
000000000040b59f	movaps	%xmm0, -0x150(%rbp)
000000000040b5a6	movq	-0x90(%rbp), %rax
000000000040b5ad	movq	0x8(%rax), %rdi
000000000040b5b1	movq	(%rdi), %rax
000000000040b5b4	callq	*0x150(%rax)
000000000040b5ba	leaq	0x90(%rax), %rsi
000000000040b5c1	leaq	-0xd8(%rbp), %rdi
000000000040b5c8	callq	__ZNK15OZSceneSettings16getFrameDurationEv ## OZSceneSettings::getFrameDuration() const
000000000040b5cd	movq	0x10(%r13), %rax
000000000040b5d1	movq	%rax, -0xe0(%rbp)
000000000040b5d8	movups	(%r13), %xmm0
000000000040b5dd	movaps	%xmm0, -0xf0(%rbp)
000000000040b5e4	cmpl	$0x1, %r15d
000000000040b5e8	jne	0x40b601
000000000040b5ea	movq	-0x170(%rbp), %rax
000000000040b5f1	movq	%rax, -0x30(%rbp)
000000000040b5f5	movups	-0x180(%rbp), %xmm0
000000000040b5fc	jmp	0x40b835
000000000040b601	leaq	-0x40(%rbp), %rdi
000000000040b605	leaq	-0xf0(%rbp), %rsi
000000000040b60c	leaq	-0xd8(%rbp), %rbx
000000000040b613	movq	%rbx, %rdx
000000000040b616	callq	0x6dfc42                        ## symbol stub for: __ZdvRK6CMTimeS1_
000000000040b61b	movq	-0x30(%rbp), %rax
000000000040b61f	movq	%rax, 0x10(%rsp)
000000000040b624	movups	-0x40(%rbp), %xmm0
000000000040b628	movups	%xmm0, (%rsp)
000000000040b62c	callq	0x6dcac2                        ## symbol stub for: _CMTimeGetSeconds
000000000040b631	movsd	%xmm0, -0xc0(%rbp)
000000000040b639	leaq	-0x180(%rbp), %r14
000000000040b640	movq	-0x170(%rbp), %rax
000000000040b647	movq	%rax, -0x100(%rbp)
000000000040b64e	movups	-0x180(%rbp), %xmm0
000000000040b655	movaps	%xmm0, -0x110(%rbp)
000000000040b65c	leaq	-0x40(%rbp), %rdi
000000000040b660	leaq	-0x110(%rbp), %rsi
000000000040b667	movq	%rbx, %rdx
000000000040b66a	callq	0x6dfc42                        ## symbol stub for: __ZdvRK6CMTimeS1_
000000000040b66f	movq	-0x30(%rbp), %rax
000000000040b673	movq	%rax, 0x10(%rsp)
000000000040b678	movups	-0x40(%rbp), %xmm0
000000000040b67c	movups	%xmm0, (%rsp)
000000000040b680	callq	0x6dcac2                        ## symbol stub for: _CMTimeGetSeconds
000000000040b685	movaps	%xmm0, -0x90(%rbp)
000000000040b68c	leaq	-0x40(%rbp), %rdi
000000000040b690	leaq	-0x150(%rbp), %rsi
000000000040b697	movq	%rbx, %rdx
000000000040b69a	callq	0x6dfc42                        ## symbol stub for: __ZdvRK6CMTimeS1_
000000000040b69f	movq	-0x30(%rbp), %rax
000000000040b6a3	movq	%rax, 0x10(%rsp)
000000000040b6a8	movups	-0x40(%rbp), %xmm0
000000000040b6ac	movups	%xmm0, (%rsp)
000000000040b6b0	callq	0x6dcac2                        ## symbol stub for: _CMTimeGetSeconds
000000000040b6b5	movsd	-0xc0(%rbp), %xmm3
000000000040b6bd	movapd	-0x90(%rbp), %xmm1
000000000040b6c5	addsd	0x2fc05b(%rip), %xmm1
000000000040b6cd	movapd	%xmm3, %xmm2
000000000040b6d1	subsd	%xmm1, %xmm2
000000000040b6d5	andpd	0x2fb733(%rip), %xmm2
000000000040b6dd	movsd	0x2fb7eb(%rip), %xmm4
000000000040b6e5	ucomisd	%xmm2, %xmm4
000000000040b6e9	ja	0x40b7b4
000000000040b6ef	ucomisd	%xmm3, %xmm1
000000000040b6f3	jbe	0x40b7b4
000000000040b6f9	movsd	%xmm0, -0x160(%rbp)
000000000040b701	movl	-0xa8(%rbp), %eax
000000000040b707	xorps	%xmm0, %xmm0
000000000040b70a	cvtsi2sd	%rax, %xmm0
000000000040b70f	movsd	%xmm0, -0x158(%rbp)
000000000040b717	mulsd	%xmm0, %xmm3
000000000040b71b	movapd	%xmm3, %xmm0
000000000040b71f	movapd	%xmm1, -0x90(%rbp)
000000000040b727	callq	0x6dfe1c                        ## symbol stub for: _fmod
000000000040b72c	movapd	%xmm0, -0xc0(%rbp)
000000000040b734	leaq	0x1c80(%r12), %rdi
000000000040b73c	movq	0x418dcd(%rip), %rsi            ## literal pool symbol address: _kCMTimeZero
000000000040b743	xorpd	%xmm0, %xmm0
000000000040b747	callq	0x6dfa80                        ## symbol stub for: __ZNK9OZChannel13getValueAsIntERK6CMTimed
000000000040b74c	cmpl	$0x1, %eax
000000000040b74f	jne	0x40b7e3
000000000040b755	movsd	-0x160(%rbp), %xmm0
000000000040b75d	mulsd	-0x158(%rbp), %xmm0
000000000040b765	movapd	-0x90(%rbp), %xmm2
000000000040b76d	divsd	%xmm2, %xmm0
000000000040b771	roundsd	$0x9, %xmm0, %xmm0
000000000040b777	mulsd	0x2fb729(%rip), %xmm0
000000000040b77f	xorps	%xmm1, %xmm1
000000000040b782	roundsd	$0x9, %xmm0, %xmm1
000000000040b788	subsd	%xmm1, %xmm0
000000000040b78c	andpd	0x2fb67c(%rip), %xmm0
000000000040b794	movapd	-0xc0(%rbp), %xmm1
000000000040b79c	subsd	%xmm1, %xmm2
000000000040b7a0	cmpltsd	0x2fb727(%rip), %xmm0
000000000040b7a9	blendvpd	%xmm0, %xmm1, %xmm2
000000000040b7ae	movapd	%xmm2, %xmm0
000000000040b7b2	jmp	0x40b7eb
000000000040b7b4	leaq	0x1c80(%r12), %rdi
000000000040b7bc	movq	0x418d4d(%rip), %rbx            ## literal pool symbol address: _kCMTimeZero
000000000040b7c3	xorps	%xmm0, %xmm0
000000000040b7c6	movq	%rbx, %rsi
000000000040b7c9	callq	0x6dfa80                        ## symbol stub for: __ZNK9OZChannel13getValueAsIntERK6CMTimed
000000000040b7ce	cmpl	$0x1, %eax
000000000040b7d1	jne	0x40b829
000000000040b7d3	movq	0x10(%rbx), %rax
000000000040b7d7	movq	%rax, -0xe0(%rbp)
000000000040b7de	movups	(%rbx), %xmm0
000000000040b7e1	jmp	0x40b822
000000000040b7e3	movapd	-0xc0(%rbp), %xmm0
000000000040b7eb	movl	-0xe8(%rbp), %esi
000000000040b7f1	leaq	-0x110(%rbp), %rbx
000000000040b7f8	movq	%rbx, %rdi
000000000040b7fb	callq	0x6dd254                        ## symbol stub for: __Z26OZFigTimeForChannelSecondsdi
000000000040b800	leaq	-0x40(%rbp), %rdi
000000000040b804	leaq	-0xd8(%rbp), %rdx
000000000040b80b	movq	%rbx, %rsi
000000000040b80e	callq	0x6dfc6c                        ## symbol stub for: __ZmlRK6CMTimeS1_
000000000040b813	movq	-0x30(%rbp), %rax
000000000040b817	movq	%rax, -0xe0(%rbp)
000000000040b81e	movups	-0x40(%rbp), %xmm0
000000000040b822	movaps	%xmm0, -0xf0(%rbp)
000000000040b829	movq	0x10(%r14), %rax
000000000040b82d	movq	%rax, -0x30(%rbp)
000000000040b831	movups	(%r14), %xmm0
000000000040b835	movaps	%xmm0, -0x40(%rbp)
000000000040b839	movq	-0xc8(%rbp), %rax
000000000040b840	movq	%rax, 0x28(%rsp)
000000000040b845	movups	-0xd8(%rbp), %xmm0
000000000040b84c	movups	%xmm0, 0x18(%rsp)
000000000040b851	movq	-0x30(%rbp), %rax
000000000040b855	movq	%rax, 0x10(%rsp)
000000000040b85a	movaps	-0x40(%rbp), %xmm0
000000000040b85e	movups	%xmm0, (%rsp)
000000000040b862	leaq	-0x80(%rbp), %rdi
000000000040b866	callq	0x6dcf0c                        ## symbol stub for: _PC_CMTimeSaferSubtract
000000000040b86b	movq	-0xe0(%rbp), %rax
000000000040b872	movq	%rax, -0x50(%rbp)
000000000040b876	movapd	-0xf0(%rbp), %xmm0
000000000040b87e	movapd	%xmm0, -0x60(%rbp)
000000000040b883	movq	-0xa0(%rbp), %rcx
000000000040b88a	testl	$0xfffffff7, %ecx               ## imm = 0xFFFFFFF7
000000000040b890	je	0x40b921
000000000040b896	decl	%ecx
000000000040b898	cmpl	$0x5, %ecx
000000000040b89b	ja	0x40bd15
000000000040b8a1	leaq	0x728(%rip), %rax
000000000040b8a8	movslq	(%rax,%rcx,4), %rcx
000000000040b8ac	addq	%rax, %rcx
000000000040b8af	jmpq	*%rcx
000000000040b8b1	leaq	0x1e18(%r12), %rdi
000000000040b8b9	movq	0x418c50(%rip), %rsi            ## literal pool symbol address: _kCMTimeZero
000000000040b8c0	xorpd	%xmm0, %xmm0
000000000040b8c4	callq	0x6dfa80                        ## symbol stub for: __ZNK9OZChannel13getValueAsIntERK6CMTimed
000000000040b8c9	leaq	-0x40(%rbp), %rdi
000000000040b8cd	leaq	-0x60(%rbp), %rsi
000000000040b8d1	leaq	-0x80(%rbp), %rdx
000000000040b8d5	testl	%eax, %eax
000000000040b8d7	je	0x40bc98
000000000040b8dd	callq	0x6dfc42                        ## symbol stub for: __ZdvRK6CMTimeS1_
000000000040b8e2	movq	-0x30(%rbp), %rax
000000000040b8e6	movq	%rax, 0x10(%rsp)
000000000040b8eb	movupd	-0x40(%rbp), %xmm0
000000000040b8f0	movupd	%xmm0, (%rsp)
000000000040b8f5	callq	0x6dcac2                        ## symbol stub for: _CMTimeGetSeconds
000000000040b8fa	addsd	0x2fb5e6(%rip), %xmm0
000000000040b902	mulsd	0x2fd4d6(%rip), %xmm0
000000000040b90a	callq	0x6dfd92                        ## symbol stub for: _cos
000000000040b90f	addsd	0x2f9ac9(%rip), %xmm0
000000000040b917	movsd	%xmm0, -0x48(%rbp)
000000000040b91c	jmp	0x40bd15
000000000040b921	leaq	-0x40(%rbp), %rdi
000000000040b925	leaq	-0x60(%rbp), %rsi
000000000040b929	leaq	-0x80(%rbp), %rdx
000000000040b92d	callq	0x6dfc42                        ## symbol stub for: __ZdvRK6CMTimeS1_
000000000040b932	movq	-0x30(%rbp), %rax
000000000040b936	movq	%rax, 0x10(%rsp)
000000000040b93b	movupd	-0x40(%rbp), %xmm0
000000000040b940	movupd	%xmm0, (%rsp)
000000000040b945	callq	0x6dcac2                        ## symbol stub for: _CMTimeGetSeconds
000000000040b94a	movsd	%xmm0, -0x48(%rbp)
000000000040b94f	jmp	0x40bd15
000000000040b954	leaq	-0x40(%rbp), %rdi
000000000040b958	leaq	-0x80(%rbp), %rsi
000000000040b95c	leaq	-0xd8(%rbp), %rbx
000000000040b963	movq	%rbx, %rdx
000000000040b966	callq	0x6dfc42                        ## symbol stub for: __ZdvRK6CMTimeS1_
000000000040b96b	movq	-0x30(%rbp), %rax
000000000040b96f	movq	%rax, 0x10(%rsp)
000000000040b974	movupd	-0x40(%rbp), %xmm0
000000000040b979	movupd	%xmm0, (%rsp)
000000000040b97e	callq	0x6dcac2                        ## symbol stub for: _CMTimeGetSeconds
000000000040b983	mulsd	%xmm0, %xmm0
000000000040b987	movsd	0x2f9a51(%rip), %xmm1
000000000040b98f	divsd	%xmm0, %xmm1
000000000040b993	movsd	%xmm1, -0xa0(%rbp)
000000000040b99b	leaq	-0x40(%rbp), %rdi
000000000040b99f	leaq	-0x60(%rbp), %rsi
000000000040b9a3	movq	%rbx, %rdx
000000000040b9a6	callq	0x6dfc42                        ## symbol stub for: __ZdvRK6CMTimeS1_
000000000040b9ab	movq	-0x30(%rbp), %rax
000000000040b9af	movq	%rax, 0x10(%rsp)
000000000040b9b4	movupd	-0x40(%rbp), %xmm0
000000000040b9b9	movupd	%xmm0, (%rsp)
000000000040b9be	callq	0x6dcac2                        ## symbol stub for: _CMTimeGetSeconds
000000000040b9c3	mulsd	%xmm0, %xmm0
000000000040b9c7	mulsd	-0xa0(%rbp), %xmm0
000000000040b9cf	movsd	%xmm0, -0x48(%rbp)
000000000040b9d4	jmp	0x40bd15
000000000040b9d9	leaq	0x1e18(%r12), %rdi
000000000040b9e1	movq	0x418b28(%rip), %rsi            ## literal pool symbol address: _kCMTimeZero
000000000040b9e8	xorpd	%xmm0, %xmm0
000000000040b9ec	callq	0x6dfa80                        ## symbol stub for: __ZNK9OZChannel13getValueAsIntERK6CMTimed
000000000040b9f1	leaq	-0x40(%rbp), %rdi
000000000040b9f5	leaq	-0x60(%rbp), %rsi
000000000040b9f9	leaq	-0x80(%rbp), %rdx
000000000040b9fd	testl	%eax, %eax
000000000040b9ff	je	0x40bc25
000000000040ba05	callq	0x6dfc42                        ## symbol stub for: __ZdvRK6CMTimeS1_
000000000040ba0a	movq	-0x30(%rbp), %rax
000000000040ba0e	movq	%rax, 0x10(%rsp)
000000000040ba13	movupd	-0x40(%rbp), %xmm0
000000000040ba18	movupd	%xmm0, (%rsp)
000000000040ba1d	callq	0x6dcac2                        ## symbol stub for: _CMTimeGetSeconds
000000000040ba22	addsd	0x2f99b6(%rip), %xmm0
000000000040ba2a	mulsd	0x2fd38e(%rip), %xmm0
000000000040ba32	callq	0x6dfd92                        ## symbol stub for: _cos
000000000040ba37	addsd	0x2f99a1(%rip), %xmm0
000000000040ba3f	mulsd	0x2fb461(%rip), %xmm0
000000000040ba47	movsd	%xmm0, -0x48(%rbp)
000000000040ba4c	jmp	0x40bd15
000000000040ba51	leaq	-0x130(%rbp), %rdi
000000000040ba58	leaq	-0x80(%rbp), %rsi
000000000040ba5c	movsd	0x2fb444(%rip), %xmm0
000000000040ba64	callq	0x6dfc72                        ## symbol stub for: __ZmlRK6CMTimed
000000000040ba69	movq	-0x120(%rbp), %rax
000000000040ba70	movq	%rax, 0x28(%rsp)
000000000040ba75	movaps	-0x130(%rbp), %xmm0
000000000040ba7c	movups	%xmm0, 0x18(%rsp)
000000000040ba81	movq	-0x50(%rbp), %rax
000000000040ba85	movq	%rax, 0x10(%rsp)
000000000040ba8a	movaps	-0x60(%rbp), %xmm0
000000000040ba8e	movups	%xmm0, (%rsp)
000000000040ba92	callq	0x6dcab0                        ## symbol stub for: _CMTimeCompare
000000000040ba97	leaq	-0x40(%rbp), %rdi
000000000040ba9b	leaq	-0x130(%rbp), %rsi
000000000040baa2	leaq	-0x60(%rbp), %rdx
000000000040baa6	testl	%eax, %eax
000000000040baa8	jle	0x40bc68
000000000040baae	callq	0x6dfc6c                        ## symbol stub for: __ZmlRK6CMTimeS1_
000000000040bab3	movq	-0x30(%rbp), %rax
000000000040bab7	movq	%rax, 0x10(%rsp)
000000000040babc	movupd	-0x40(%rbp), %xmm0
000000000040bac1	movupd	%xmm0, (%rsp)
000000000040bac6	callq	0x6dcac2                        ## symbol stub for: _CMTimeGetSeconds
000000000040bacb	movsd	0x2fbc55(%rip), %xmm1
000000000040bad3	divsd	%xmm0, %xmm1
000000000040bad7	addsd	0x2fb409(%rip), %xmm1
000000000040badf	movsd	%xmm1, -0x48(%rbp)
000000000040bae4	jmp	0x40bd15
000000000040bae9	leaq	0x1e18(%r12), %rdi
000000000040baf1	movq	0x418a18(%rip), %rsi            ## literal pool symbol address: _kCMTimeZero
000000000040baf8	xorpd	%xmm0, %xmm0
000000000040bafc	callq	0x6dfa80                        ## symbol stub for: __ZNK9OZChannel13getValueAsIntERK6CMTimed
000000000040bb01	leaq	-0x40(%rbp), %rdi
000000000040bb05	leaq	-0x60(%rbp), %rsi
000000000040bb09	leaq	-0x80(%rbp), %rdx
000000000040bb0d	testl	%eax, %eax
000000000040bb0f	je	0x40bcd4
000000000040bb15	callq	0x6dfc42                        ## symbol stub for: __ZdvRK6CMTimeS1_
000000000040bb1a	movq	-0x30(%rbp), %rax
000000000040bb1e	movq	%rax, 0x10(%rsp)
000000000040bb23	movupd	-0x40(%rbp), %xmm0
000000000040bb28	movupd	%xmm0, (%rsp)
000000000040bb2d	callq	0x6dcac2                        ## symbol stub for: _CMTimeGetSeconds
000000000040bb32	mulsd	0x2fd2a6(%rip), %xmm0
000000000040bb3a	callq	0x6e00da                        ## symbol stub for: _sin
000000000040bb3f	movsd	%xmm0, -0x48(%rbp)
000000000040bb44	jmp	0x40bd15
000000000040bb49	leaq	-0x40(%rbp), %rdi
000000000040bb4d	leaq	-0x80(%rbp), %rsi
000000000040bb51	leaq	-0xd8(%rbp), %rbx
000000000040bb58	movq	%rbx, %rdx
000000000040bb5b	callq	0x6dfc42                        ## symbol stub for: __ZdvRK6CMTimeS1_
000000000040bb60	movq	-0x30(%rbp), %rax
000000000040bb64	movq	%rax, 0x10(%rsp)
000000000040bb69	movupd	-0x40(%rbp), %xmm0
000000000040bb6e	movupd	%xmm0, (%rsp)
000000000040bb73	callq	0x6dcac2                        ## symbol stub for: _CMTimeGetSeconds
000000000040bb78	mulsd	%xmm0, %xmm0
000000000040bb7c	movsd	0x2f985c(%rip), %xmm1
000000000040bb84	divsd	%xmm0, %xmm1
000000000040bb88	movsd	%xmm1, -0xa0(%rbp)
000000000040bb90	movq	-0x50(%rbp), %rax
000000000040bb94	movq	%rax, 0x28(%rsp)
000000000040bb99	movaps	-0x60(%rbp), %xmm0
000000000040bb9d	movups	%xmm0, 0x18(%rsp)
000000000040bba2	movq	-0x70(%rbp), %rax
000000000040bba6	movq	%rax, 0x10(%rsp)
000000000040bbab	movaps	-0x80(%rbp), %xmm0
000000000040bbaf	movups	%xmm0, (%rsp)
000000000040bbb3	leaq	-0x110(%rbp), %r14
000000000040bbba	movq	%r14, %rdi
000000000040bbbd	callq	0x6dcf0c                        ## symbol stub for: _PC_CMTimeSaferSubtract
000000000040bbc2	leaq	-0x40(%rbp), %rdi
000000000040bbc6	movq	%r14, %rsi
000000000040bbc9	movq	%rbx, %rdx
000000000040bbcc	callq	0x6dfc42                        ## symbol stub for: __ZdvRK6CMTimeS1_
000000000040bbd1	movq	-0x30(%rbp), %rax
000000000040bbd5	movq	%rax, 0x10(%rsp)
000000000040bbda	movupd	-0x40(%rbp), %xmm0
000000000040bbdf	movupd	%xmm0, (%rsp)
000000000040bbe4	callq	0x6dcac2                        ## symbol stub for: _CMTimeGetSeconds
000000000040bbe9	mulsd	%xmm0, %xmm0
000000000040bbed	mulsd	-0xa0(%rbp), %xmm0
000000000040bbf5	movsd	0x2f97e3(%rip), %xmm2
000000000040bbfd	movapd	%xmm2, %xmm1
000000000040bc01	minsd	%xmm0, %xmm1
000000000040bc05	subsd	%xmm1, %xmm2
000000000040bc09	xorpd	%xmm1, %xmm1
000000000040bc0d	cmpltsd	%xmm1, %xmm0
000000000040bc12	blendvpd	%xmm0, 0x2fb1c5(%rip), %xmm2
000000000040bc1b	movlpd	%xmm2, -0x48(%rbp)
000000000040bc20	jmp	0x40bd15
000000000040bc25	callq	0x6dfc42                        ## symbol stub for: __ZdvRK6CMTimeS1_
000000000040bc2a	movq	-0x30(%rbp), %rax
000000000040bc2e	movq	%rax, 0x10(%rsp)
000000000040bc33	movupd	-0x40(%rbp), %xmm0
000000000040bc38	movupd	%xmm0, (%rsp)
000000000040bc3d	callq	0x6dcac2                        ## symbol stub for: _CMTimeGetSeconds
000000000040bc42	movsd	%xmm0, -0x48(%rbp)
000000000040bc47	movsd	0x2fb259(%rip), %xmm1
000000000040bc4f	movsd	0x2f9789(%rip), %xmm4
000000000040bc57	leaq	-0x48(%rbp), %rdi
000000000040bc5b	xorpd	%xmm3, %xmm3
000000000040bc5f	movapd	%xmm1, %xmm2
000000000040bc63	jmp	0x40bd0e
000000000040bc68	callq	0x6dfc6c                        ## symbol stub for: __ZmlRK6CMTimeS1_
000000000040bc6d	movq	-0x30(%rbp), %rax
000000000040bc71	movq	%rax, 0x10(%rsp)
000000000040bc76	movupd	-0x40(%rbp), %xmm0
000000000040bc7b	movupd	%xmm0, (%rsp)
000000000040bc80	callq	0x6dcac2                        ## symbol stub for: _CMTimeGetSeconds
000000000040bc85	movsd	0x2f9753(%rip), %xmm1
000000000040bc8d	divsd	%xmm0, %xmm1
000000000040bc91	movsd	%xmm1, -0x48(%rbp)
000000000040bc96	jmp	0x40bd15
000000000040bc98	callq	0x6dfc42                        ## symbol stub for: __ZdvRK6CMTimeS1_
000000000040bc9d	movq	-0x30(%rbp), %rax
000000000040bca1	movq	%rax, 0x10(%rsp)
000000000040bca6	movupd	-0x40(%rbp), %xmm0
000000000040bcab	movupd	%xmm0, (%rsp)
000000000040bcb0	callq	0x6dcac2                        ## symbol stub for: _CMTimeGetSeconds
000000000040bcb5	movsd	%xmm0, -0x48(%rbp)
000000000040bcba	movsd	0x2f971e(%rip), %xmm1
000000000040bcc2	leaq	-0x48(%rbp), %rdi
000000000040bcc6	xorpd	%xmm2, %xmm2
000000000040bcca	xorpd	%xmm3, %xmm3
000000000040bcce	movapd	%xmm1, %xmm4
000000000040bcd2	jmp	0x40bd0e
000000000040bcd4	callq	0x6dfc42                        ## symbol stub for: __ZdvRK6CMTimeS1_
000000000040bcd9	movq	-0x30(%rbp), %rax
000000000040bcdd	movq	%rax, 0x10(%rsp)
000000000040bce2	movupd	-0x40(%rbp), %xmm0
000000000040bce7	movupd	%xmm0, (%rsp)
000000000040bcec	callq	0x6dcac2                        ## symbol stub for: _CMTimeGetSeconds
000000000040bcf1	movsd	%xmm0, -0x48(%rbp)
000000000040bcf6	movsd	0x2f96e2(%rip), %xmm2
000000000040bcfe	leaq	-0x48(%rbp), %rdi
000000000040bd02	xorpd	%xmm1, %xmm1
000000000040bd06	xorpd	%xmm3, %xmm3
000000000040bd0a	movapd	%xmm2, %xmm4
000000000040bd0e	xorl	%esi, %esi
000000000040bd10	callq	0x6dea5a                        ## symbol stub for: __ZN6PCMath9easeInOutEdddddPdS0_
000000000040bd15	movsd	-0x48(%rbp), %xmm0
000000000040bd1a	movsd	0x2f96be(%rip), %xmm1
000000000040bd22	minsd	%xmm0, %xmm1
000000000040bd26	xorpd	%xmm2, %xmm2
000000000040bd2a	cmpltsd	%xmm2, %xmm0
000000000040bd2f	andnpd	%xmm1, %xmm0
000000000040bd33	movlpd	%xmm0, -0x48(%rbp)
000000000040bd38	cmpl	$0x1, %r15d
000000000040bd3c	jne	0x40bfac
000000000040bd42	leaq	-0x40(%rbp), %rdi
000000000040bd46	leaq	-0x80(%rbp), %rsi
000000000040bd4a	callq	0x6dfc72                        ## symbol stub for: __ZmlRK6CMTimed
000000000040bd4f	movq	-0x30(%rbp), %rax
000000000040bd53	movq	%rax, -0x50(%rbp)
000000000040bd57	movups	-0x40(%rbp), %xmm0
000000000040bd5b	movaps	%xmm0, -0x60(%rbp)
000000000040bd5f	movaps	%xmm0, -0x150(%rbp)
000000000040bd66	movq	%rax, -0x140(%rbp)
000000000040bd6d	leaq	-0x40(%rbp), %rdi
000000000040bd71	leaq	-0x60(%rbp), %rsi
000000000040bd75	leaq	-0xd8(%rbp), %rbx
000000000040bd7c	movq	%rbx, %rdx
000000000040bd7f	callq	0x6dfc42                        ## symbol stub for: __ZdvRK6CMTimeS1_
000000000040bd84	movq	-0x30(%rbp), %rax
000000000040bd88	movq	%rax, 0x10(%rsp)
000000000040bd8d	movups	-0x40(%rbp), %xmm0
000000000040bd91	movups	%xmm0, (%rsp)
000000000040bd95	callq	0x6dcac2                        ## symbol stub for: _CMTimeGetSeconds
000000000040bd9a	movsd	%xmm0, -0x90(%rbp)
000000000040bda2	movq	-0x170(%rbp), %rax
000000000040bda9	movq	%rax, -0x100(%rbp)
000000000040bdb0	movups	-0x180(%rbp), %xmm0
000000000040bdb7	movaps	%xmm0, -0x110(%rbp)
000000000040bdbe	leaq	-0x40(%rbp), %rdi
000000000040bdc2	leaq	-0x110(%rbp), %rsi
000000000040bdc9	movq	%rbx, %rdx
000000000040bdcc	callq	0x6dfc42                        ## symbol stub for: __ZdvRK6CMTimeS1_
000000000040bdd1	movq	-0x30(%rbp), %rax
000000000040bdd5	movq	%rax, 0x10(%rsp)
000000000040bdda	movups	-0x40(%rbp), %xmm0
000000000040bdde	movups	%xmm0, (%rsp)
000000000040bde2	callq	0x6dcac2                        ## symbol stub for: _CMTimeGetSeconds
000000000040bde7	movaps	%xmm0, -0xa0(%rbp)
000000000040bdee	leaq	-0x40(%rbp), %rdi
000000000040bdf2	leaq	-0x150(%rbp), %rsi
000000000040bdf9	movq	%rbx, %rdx
000000000040bdfc	callq	0x6dfc42                        ## symbol stub for: __ZdvRK6CMTimeS1_
000000000040be01	movq	-0x30(%rbp), %rax
000000000040be05	movq	%rax, 0x10(%rsp)
000000000040be0a	movups	-0x40(%rbp), %xmm0
000000000040be0e	movups	%xmm0, (%rsp)
000000000040be12	callq	0x6dcac2                        ## symbol stub for: _CMTimeGetSeconds
000000000040be17	movsd	-0x90(%rbp), %xmm3
000000000040be1f	movapd	-0xa0(%rbp), %xmm1
000000000040be27	addsd	0x2fb8f9(%rip), %xmm1
000000000040be2f	movapd	%xmm3, %xmm2
000000000040be33	subsd	%xmm1, %xmm2
000000000040be37	andpd	0x2fafd1(%rip), %xmm2
000000000040be3f	movsd	0x2fb089(%rip), %xmm4
000000000040be47	ucomisd	%xmm2, %xmm4
000000000040be4b	ja	0x40bf18
000000000040be51	ucomisd	%xmm3, %xmm1
000000000040be55	jbe	0x40bf18
000000000040be5b	movsd	%xmm0, -0xc0(%rbp)
000000000040be63	movl	-0xa8(%rbp), %eax
000000000040be69	xorps	%xmm0, %xmm0
000000000040be6c	cvtsi2sd	%rax, %xmm0
000000000040be71	movsd	%xmm0, -0xa8(%rbp)
000000000040be79	mulsd	%xmm0, %xmm3
000000000040be7d	movapd	%xmm3, %xmm0
000000000040be81	movapd	%xmm1, -0xa0(%rbp)
000000000040be89	callq	0x6dfe1c                        ## symbol stub for: _fmod
000000000040be8e	movapd	%xmm0, -0x90(%rbp)
000000000040be96	addq	$0x1c80, %r12                   ## imm = 0x1C80
000000000040be9d	movq	0x41866c(%rip), %rsi            ## literal pool symbol address: _kCMTimeZero
000000000040bea4	xorpd	%xmm0, %xmm0
000000000040bea8	movq	%r12, %rdi
000000000040beab	callq	0x6dfa80                        ## symbol stub for: __ZNK9OZChannel13getValueAsIntERK6CMTimed
000000000040beb0	cmpl	$0x1, %eax
000000000040beb3	jne	0x40bf46
000000000040beb9	movsd	-0xc0(%rbp), %xmm0
000000000040bec1	mulsd	-0xa8(%rbp), %xmm0
000000000040bec9	movapd	-0xa0(%rbp), %xmm2
000000000040bed1	divsd	%xmm2, %xmm0
000000000040bed5	roundsd	$0x9, %xmm0, %xmm0
000000000040bedb	mulsd	0x2fafc5(%rip), %xmm0
000000000040bee3	xorps	%xmm1, %xmm1
000000000040bee6	roundsd	$0x9, %xmm0, %xmm1
000000000040beec	subsd	%xmm1, %xmm0
000000000040bef0	andpd	0x2faf18(%rip), %xmm0
000000000040bef8	movapd	-0x90(%rbp), %xmm1
000000000040bf00	subsd	%xmm1, %xmm2
000000000040bf04	cmpltsd	0x2fafc3(%rip), %xmm0
000000000040bf0d	blendvpd	%xmm0, %xmm1, %xmm2
000000000040bf12	movapd	%xmm2, %xmm0
000000000040bf16	jmp	0x40bf4e
000000000040bf18	addq	$0x1c80, %r12                   ## imm = 0x1C80
000000000040bf1f	movq	0x4185ea(%rip), %rbx            ## literal pool symbol address: _kCMTimeZero
000000000040bf26	xorps	%xmm0, %xmm0
000000000040bf29	movq	%r12, %rdi
000000000040bf2c	movq	%rbx, %rsi
000000000040bf2f	callq	0x6dfa80                        ## symbol stub for: __ZNK9OZChannel13getValueAsIntERK6CMTimed
000000000040bf34	cmpl	$0x1, %eax
000000000040bf37	jne	0x40bf83
000000000040bf39	movq	0x10(%rbx), %rax
000000000040bf3d	movq	%rax, -0x50(%rbp)
000000000040bf41	movups	(%rbx), %xmm0
000000000040bf44	jmp	0x40bf7f
000000000040bf46	movapd	-0x90(%rbp), %xmm0
000000000040bf4e	movl	-0x58(%rbp), %esi
000000000040bf51	leaq	-0x110(%rbp), %rbx
000000000040bf58	movq	%rbx, %rdi
000000000040bf5b	callq	0x6dd254                        ## symbol stub for: __Z26OZFigTimeForChannelSecondsdi
000000000040bf60	leaq	-0x40(%rbp), %rdi
000000000040bf64	leaq	-0xd8(%rbp), %rdx
000000000040bf6b	movq	%rbx, %rsi
000000000040bf6e	callq	0x6dfc6c                        ## symbol stub for: __ZmlRK6CMTimeS1_
000000000040bf73	movq	-0x30(%rbp), %rax
000000000040bf77	movq	%rax, -0x50(%rbp)
000000000040bf7b	movups	-0x40(%rbp), %xmm0
000000000040bf7f	movaps	%xmm0, -0x60(%rbp)
000000000040bf83	leaq	-0x40(%rbp), %rdi
000000000040bf87	leaq	-0x60(%rbp), %rsi
000000000040bf8b	leaq	-0x80(%rbp), %rdx
000000000040bf8f	callq	0x6dfc42                        ## symbol stub for: __ZdvRK6CMTimeS1_
000000000040bf94	movq	-0x30(%rbp), %rax
000000000040bf98	movq	%rax, 0x10(%rsp)
000000000040bf9d	movupd	-0x40(%rbp), %xmm0
000000000040bfa2	movupd	%xmm0, (%rsp)
000000000040bfa7	callq	0x6dcac2                        ## symbol stub for: _CMTimeGetSeconds
000000000040bfac	movsd	-0x168(%rbp), %xmm1
000000000040bfb4	mulsd	%xmm0, %xmm1
000000000040bfb8	movapd	%xmm1, %xmm0
000000000040bfbc	addq	$0x1a8, %rsp                    ## imm = 0x1A8
000000000040bfc3	popq	%rbx
000000000040bfc4	popq	%r12
000000000040bfc6	popq	%r13
000000000040bfc8	popq	%r14
000000000040bfca	popq	%r15
000000000040bfcc	popq	%rbp
000000000040bfcd	retq
000000000040bfce	nop
000000000040bfd0	loope	0x40bfca
000000000040bfd2	.byte 0xff #bad opcode
000000000040bfd3	lcalll	*(%rcx)
000000000040bfd5	sti
000000000040bfd6	.byte 0xff #bad opcode
000000000040bfd7	decl	(%rcx)
000000000040bfd9	cli
000000000040bfda	.byte 0xff #bad opcode
000000000040bfdb	incl	-0x7b000006(%rcx)
000000000040bfe1	stc
000000000040bfe2	.byte 0xff #bad opcode
000000000040bfe3	.byte 0xff #bad opcode
000000000040bfe4	jns	0x40bfe1
000000000040bfe6	.byte 0xff #bad opcode
000000000040bfe7	decl	(%rdi)
000000000040bfe9	.byte 0x1f #bad opcode
000000000040bfea	testb	%al, (%rax)
000000000040bfec	addb	%al, (%rax)
000000000040bfee	addb	%al, (%rax)
