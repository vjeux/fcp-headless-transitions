__ZN21OZMotionPathCurveNode11getPositionEdRK6CMTimeS2_dd:
000000000040bff0	pushq	%rbp
000000000040bff1	movq	%rsp, %rbp
000000000040bff4	pushq	%r15
000000000040bff6	pushq	%r14
000000000040bff8	pushq	%r13
000000000040bffa	pushq	%r12
000000000040bffc	pushq	%rbx
000000000040bffd	subq	$0x338, %rsp                    ## imm = 0x338
000000000040c004	movsd	%xmm2, -0x40(%rbp)
000000000040c009	movsd	%xmm1, -0x78(%rbp)
000000000040c00e	movq	%rdx, %r13
000000000040c011	movq	%rsi, %r12
000000000040c014	movapd	%xmm0, -0x50(%rbp)
000000000040c019	movq	%rdi, %rbx
000000000040c01c	movq	0x8(%rdi), %rdi
000000000040c020	testq	%rdi, %rdi
000000000040c023	je	0x40c03f
000000000040c025	leaq	__ZTI10OZBehavior(%rip), %rsi   ## typeinfo for OZBehavior
000000000040c02c	leaq	__ZTI20OZMotionPathBehavior(%rip), %rdx ## typeinfo for OZMotionPathBehavior
000000000040c033	xorl	%ecx, %ecx
000000000040c035	callq	0x6dfd0e                        ## symbol stub for: ___dynamic_cast
000000000040c03a	movq	%rax, %r14
000000000040c03d	jmp	0x40c042
000000000040c03f	xorl	%r14d, %r14d
000000000040c042	leaq	0x210(%r14), %rdi
000000000040c049	movq	0x4184c0(%rip), %rsi            ## literal pool symbol address: _kCMTimeZero
000000000040c050	xorpd	%xmm0, %xmm0
000000000040c054	callq	0x6dfa80                        ## symbol stub for: __ZNK9OZChannel13getValueAsIntERK6CMTimed
000000000040c059	movq	$0x0, -0xa8(%rbp)
000000000040c064	movq	$0x0, -0x80(%rbp)
000000000040c06c	movq	$0x0, -0xe8(%rbp)
000000000040c077	movq	$0x0, -0xe0(%rbp)
000000000040c082	movq	$0x0, -0xd8(%rbp)
000000000040c08d	cmpl	$0x1, %eax
000000000040c090	ja	0x40c17a
000000000040c096	movq	0x10(%r13), %rax
000000000040c09a	movq	%rax, -0x90(%rbp)
000000000040c0a1	movupd	(%r13), %xmm0
000000000040c0a7	movapd	%xmm0, -0xa0(%rbp)
000000000040c0af	leaq	0x1850(%r14), %rdi
000000000040c0b6	movq	0x418453(%rip), %r15            ## literal pool symbol address: _kCMTimeZero
000000000040c0bd	xorpd	%xmm0, %xmm0
000000000040c0c1	movq	%r15, %rsi
000000000040c0c4	callq	0x6dfa80                        ## symbol stub for: __ZNK9OZChannel13getValueAsIntERK6CMTimed
000000000040c0c9	cmpl	$0x1, %eax
000000000040c0cc	jne	0x40c0dd
000000000040c0ce	movsd	-0x40(%rbp), %xmm0
000000000040c0d3	subsd	-0x50(%rbp), %xmm0
000000000040c0d8	movapd	%xmm0, -0x50(%rbp)
000000000040c0dd	leaq	0x1950(%r14), %rdi
000000000040c0e4	xorpd	%xmm0, %xmm0
000000000040c0e8	movq	%r15, %rsi
000000000040c0eb	callq	0x6dfa80                        ## symbol stub for: __ZNK9OZChannel13getValueAsIntERK6CMTimed
000000000040c0f0	cmpl	$0x8, %eax
000000000040c0f3	jne	0x40c115
000000000040c0f5	leaq	0xa00(%r14), %rdi
000000000040c0fc	movq	0x41840d(%rip), %rsi            ## literal pool symbol address: _kCMTimeZero
000000000040c103	xorpd	%xmm0, %xmm0
000000000040c107	callq	0x6dfa80                        ## symbol stub for: __ZNK9OZChannel13getValueAsIntERK6CMTimed
000000000040c10c	cmpl	$0x1, %eax
000000000040c10f	jne	0x40c37c
000000000040c115	movq	$0x0, -0x330(%rbp)
000000000040c120	movapd	-0x50(%rbp), %xmm0
000000000040c125	movsd	-0x40(%rbp), %xmm1
000000000040c12a	movq	%r14, %rdi
000000000040c12d	ucomisd	%xmm1, %xmm0
000000000040c131	jae	0x40c32c
000000000040c137	callq	__ZN20OZMotionPathBehavior18getPositionChannelEv ## OZMotionPathBehavior::getPositionChannel()
000000000040c13c	movapd	-0x50(%rbp), %xmm0
000000000040c141	xorpd	%xmm1, %xmm1
000000000040c145	movq	0x4183c4(%rip), %rsi            ## literal pool symbol address: _kCMTimeZero
000000000040c14c	leaq	-0xe8(%rbp), %rdx
000000000040c153	leaq	-0xe0(%rbp), %rcx
000000000040c15a	leaq	-0xd8(%rbp), %r8
000000000040c161	leaq	-0x330(%rbp), %r9
000000000040c168	ucomisd	%xmm0, %xmm1
000000000040c16c	jb	0x40c172
000000000040c16e	xorpd	%xmm0, %xmm0
000000000040c172	movq	%rax, %rdi
000000000040c175	jmp	0x40c35c
000000000040c17a	addl	$-0x2, %eax
000000000040c17d	cmpl	$0x3, %eax
000000000040c180	ja	0x40c8f2
000000000040c186	leaq	0x13cf(%rip), %rcx
000000000040c18d	movslq	(%rcx,%rax,4), %rax
000000000040c191	addq	%rcx, %rax
000000000040c194	jmpq	*%rax
000000000040c196	movq	0x8(%rbx), %rdi
000000000040c19a	movq	(%rdi), %rax
000000000040c19d	callq	*0x150(%rax)
000000000040c1a3	movsd	0x2f9235(%rip), %xmm0
000000000040c1ab	divsd	0xc0(%rax), %xmm0
000000000040c1b3	movsd	%xmm0, -0xc8(%rbp)
000000000040c1bb	leaq	0xb88(%r14), %rdi
000000000040c1c2	xorpd	%xmm0, %xmm0
000000000040c1c6	movsd	%xmm0, -0x60(%rbp)
000000000040c1cb	movq	%r13, %rsi
000000000040c1ce	callq	0x6dfa9e                        ## symbol stub for: __ZNK9OZChannel16getValueAsDoubleERK6CMTimed
000000000040c1d3	movapd	%xmm0, -0x40(%rbp)
000000000040c1d8	leaq	0xc20(%r14), %rdi
000000000040c1df	xorpd	%xmm0, %xmm0
000000000040c1e3	movq	%r13, %rsi
000000000040c1e6	callq	0x6dfa9e                        ## symbol stub for: __ZNK9OZChannel16getValueAsDoubleERK6CMTimed
000000000040c1eb	movapd	%xmm0, -0xc0(%rbp)
000000000040c1f3	movq	%rbx, %rdi
000000000040c1f6	movq	%r13, %rsi
000000000040c1f9	callq	__ZN21OZMotionPathCurveNode9getLengthERK6CMTime ## OZMotionPathCurveNode::getLength(CMTime const&)
000000000040c1fe	movapd	%xmm0, -0x70(%rbp)
000000000040c203	leaq	0x1720(%r14), %rdi
000000000040c20a	xorpd	%xmm0, %xmm0
000000000040c20e	movq	%r13, %rsi
000000000040c211	callq	0x6dfa9e                        ## symbol stub for: __ZNK9OZChannel16getValueAsDoubleERK6CMTimed
000000000040c216	movapd	%xmm0, %xmm2
000000000040c21a	movapd	0x2fabee(%rip), %xmm0
000000000040c222	andpd	-0x70(%rbp), %xmm0
000000000040c227	movsd	0x2faca1(%rip), %xmm1
000000000040c22f	ucomisd	%xmm0, %xmm1
000000000040c233	ja	0x40c2ad
000000000040c235	leaq	0x1850(%r14), %rdi
000000000040c23c	movq	0x4182cd(%rip), %rsi            ## literal pool symbol address: _kCMTimeZero
000000000040c243	xorpd	%xmm0, %xmm0
000000000040c247	movsd	%xmm2, -0x60(%rbp)
000000000040c24c	callq	0x6dfa80                        ## symbol stub for: __ZNK9OZChannel13getValueAsIntERK6CMTimed
000000000040c251	movapd	-0x50(%rbp), %xmm2
000000000040c256	divsd	-0x70(%rbp), %xmm2
000000000040c25b	addsd	-0x60(%rbp), %xmm2
000000000040c260	xorps	%xmm0, %xmm0
000000000040c263	roundsd	$0xb, %xmm2, %xmm0
000000000040c269	movapd	%xmm2, %xmm1
000000000040c26d	subsd	%xmm0, %xmm1
000000000040c271	andpd	0x2fab97(%rip), %xmm1
000000000040c279	andpd	0x2fb2df(%rip), %xmm2
000000000040c281	orpd	%xmm1, %xmm2
000000000040c285	movsd	%xmm2, -0x60(%rbp)
000000000040c28a	cmpl	$0x1, %eax
000000000040c28d	jne	0x40c2ad
000000000040c28f	movsd	0x2f9149(%rip), %xmm1
000000000040c297	subsd	%xmm2, %xmm1
000000000040c29b	movapd	-0x70(%rbp), %xmm0
000000000040c2a0	mulsd	%xmm0, %xmm1
000000000040c2a4	divsd	%xmm0, %xmm1
000000000040c2a8	movsd	%xmm1, -0x60(%rbp)
000000000040c2ad	movapd	-0x40(%rbp), %xmm0
000000000040c2b2	mulsd	-0xc8(%rbp), %xmm0
000000000040c2ba	movapd	%xmm0, -0x40(%rbp)
000000000040c2bf	addq	$0x1950, %r14                   ## imm = 0x1950
000000000040c2c6	movq	0x418243(%rip), %rsi            ## literal pool symbol address: _kCMTimeZero
000000000040c2cd	xorpd	%xmm0, %xmm0
000000000040c2d1	movq	%r14, %rdi
000000000040c2d4	callq	0x6dfa80                        ## symbol stub for: __ZNK9OZChannel13getValueAsIntERK6CMTimed
000000000040c2d9	cmpl	$0x8, %eax
000000000040c2dc	jne	0x40cbe4
000000000040c2e2	movsd	-0x60(%rbp), %xmm0
000000000040c2e7	mulsd	0x2fcad1(%rip), %xmm0
000000000040c2ef	addsd	%xmm0, %xmm0
000000000040c2f3	callq	0x6dfd2c                        ## symbol stub for: ___sincos_stret
000000000040c2f8	movapd	-0x40(%rbp), %xmm2
000000000040c2fd	mulsd	%xmm2, %xmm1
000000000040c301	subsd	%xmm1, %xmm2
000000000040c305	movapd	-0xc0(%rbp), %xmm1
000000000040c30d	mulsd	%xmm0, %xmm1
000000000040c311	movsd	%xmm1, -0x80(%rbp)
000000000040c316	movsd	-0x78(%rbp), %xmm1
000000000040c31b	movl	0x1c(%rbx), %eax
000000000040c31e	cmpl	$0x2, %eax
000000000040c321	jne	0x40cc55
000000000040c327	jmp	0x40cc6b
000000000040c32c	callq	__ZN20OZMotionPathBehavior18getPositionChannelEv ## OZMotionPathBehavior::getPositionChannel()
000000000040c331	movq	0x4181d8(%rip), %rsi            ## literal pool symbol address: _kCMTimeZero
000000000040c338	leaq	-0xe8(%rbp), %rdx
000000000040c33f	leaq	-0xe0(%rbp), %rcx
000000000040c346	leaq	-0xd8(%rbp), %r8
000000000040c34d	leaq	-0x330(%rbp), %r9
000000000040c354	movq	%rax, %rdi
000000000040c357	movsd	-0x40(%rbp), %xmm0
000000000040c35c	callq	0x6de550                        ## symbol stub for: __ZN19OZChannelPosition3D34getPositionReparametrizedWithRangeERK6CMTimedPdS3_S3_S3_
000000000040c361	movsd	-0x330(%rbp), %xmm0
000000000040c369	leaq	-0xa0(%rbp), %rdi
000000000040c370	movl	$0x40000, %esi                  ## imm = 0x40000
000000000040c375	callq	0x6dd254                        ## symbol stub for: __Z26OZFigTimeForChannelSecondsdi
000000000040c37a	jmp	0x40c3b3
000000000040c37c	movq	%r14, %rdi
000000000040c37f	callq	__ZN20OZMotionPathBehavior18getPositionChannelEv ## OZMotionPathBehavior::getPositionChannel()
000000000040c384	leaq	0x88(%rax), %rsi
000000000040c38b	leaq	-0x330(%rbp), %r15
000000000040c392	movq	%r15, %rdi
000000000040c395	callq	0x6df408                        ## symbol stub for: __ZN9OZChannel26getKeyframeParametricRangeEv
000000000040c39a	movapd	-0x50(%rbp), %xmm0
000000000040c39f	divsd	-0x40(%rbp), %xmm0
000000000040c3a4	leaq	-0xa0(%rbp), %rdi
000000000040c3ab	movq	%r15, %rsi
000000000040c3ae	callq	0x6dfc72                        ## symbol stub for: __ZmlRK6CMTimed
000000000040c3b3	movq	0x170(%r14), %rax
000000000040c3ba	movq	0x20(%rax), %rsi
000000000040c3be	movq	(%rsi), %rax
000000000040c3c1	leaq	-0x210(%rbp), %rdi
000000000040c3c8	callq	*0x140(%rax)
000000000040c3ce	movq	-0x200(%rbp), %rax
000000000040c3d5	movq	%rax, 0x28(%rsp)
000000000040c3da	movups	-0x210(%rbp), %xmm0
000000000040c3e1	movups	%xmm0, 0x18(%rsp)
000000000040c3e6	movq	-0x90(%rbp), %rax
000000000040c3ed	movq	%rax, 0x10(%rsp)
000000000040c3f2	movaps	-0xa0(%rbp), %xmm0
000000000040c3f9	movups	%xmm0, (%rsp)
000000000040c3fd	leaq	-0x330(%rbp), %rdi
000000000040c404	callq	0x6dcf0c                        ## symbol stub for: _PC_CMTimeSaferSubtract
000000000040c409	leaq	0x30(%r14), %rsi
000000000040c40d	leaq	-0x190(%rbp), %rdi
000000000040c414	callq	0x6df7a4                        ## symbol stub for: __ZNK23OZChannelObjectRootBase13getTimeOffsetEv
000000000040c419	movq	-0x180(%rbp), %rax
000000000040c420	movq	%rax, 0x28(%rsp)
000000000040c425	movups	-0x190(%rbp), %xmm0
000000000040c42c	movups	%xmm0, 0x18(%rsp)
000000000040c431	movq	-0x320(%rbp), %rax
000000000040c438	movq	%rax, 0x10(%rsp)
000000000040c43d	movups	-0x330(%rbp), %xmm0
000000000040c444	movups	%xmm0, (%rsp)
000000000040c448	leaq	-0x100(%rbp), %rdi
000000000040c44f	callq	0x6dcf06                        ## symbol stub for: _PC_CMTimeSaferAdd
000000000040c454	movups	-0x100(%rbp), %xmm0
000000000040c45b	movaps	%xmm0, -0xa0(%rbp)
000000000040c462	movq	-0xf0(%rbp), %rax
000000000040c469	movq	%rax, -0x90(%rbp)
000000000040c470	movq	0x170(%r14), %rax
000000000040c477	movq	0x20(%rax), %rsi
000000000040c47b	movq	(%rsi), %rax
000000000040c47e	leaq	-0x330(%rbp), %rdi
000000000040c485	leaq	-0xa0(%rbp), %r15
000000000040c48c	movq	%r15, %rdx
000000000040c48f	callq	*0x150(%rax)
000000000040c495	movq	-0x320(%rbp), %rax
000000000040c49c	movq	%rax, -0x90(%rbp)
000000000040c4a3	movupd	-0x330(%rbp), %xmm0
000000000040c4ab	movapd	%xmm0, -0xa0(%rbp)
000000000040c4b3	movq	%r14, %rdi
000000000040c4b6	callq	__ZN20OZMotionPathBehavior18getPositionChannelEv ## OZMotionPathBehavior::getPositionChannel()
000000000040c4bb	movl	0x1c(%rbx), %esi
000000000040c4be	movq	%rax, %rdi
000000000040c4c1	callq	0x6ddf5c                        ## symbol stub for: __ZN15OZChannelFolder13getDescendantEj
000000000040c4c6	xorpd	%xmm0, %xmm0
000000000040c4ca	movq	%rax, %rdi
000000000040c4cd	movq	%r15, %rsi
000000000040c4d0	callq	0x6dfa9e                        ## symbol stub for: __ZNK9OZChannel16getValueAsDoubleERK6CMTimed
000000000040c4d5	movsd	-0x78(%rbp), %xmm1
000000000040c4da	addsd	%xmm0, %xmm1
000000000040c4de	movapd	%xmm1, %xmm0
000000000040c4e2	addq	$0x338, %rsp                    ## imm = 0x338
000000000040c4e9	popq	%rbx
000000000040c4ea	popq	%r12
000000000040c4ec	popq	%r13
000000000040c4ee	popq	%r14
000000000040c4f0	popq	%r15
000000000040c4f2	popq	%rbp
000000000040c4f3	retq
000000000040c4f4	leaq	0x11b8(%r14), %rdi
000000000040c4fb	xorpd	%xmm0, %xmm0
000000000040c4ff	movq	%r13, %rsi
000000000040c502	callq	0x6dfa9e                        ## symbol stub for: __ZNK9OZChannel16getValueAsDoubleERK6CMTimed
000000000040c507	movapd	%xmm0, -0x40(%rbp)
000000000040c50c	leaq	0x1250(%r14), %rdi
000000000040c513	xorpd	%xmm0, %xmm0
000000000040c517	movq	%r13, %rsi
000000000040c51a	callq	0x6dfa9e                        ## symbol stub for: __ZNK9OZChannel16getValueAsDoubleERK6CMTimed
000000000040c51f	movapd	%xmm0, -0x60(%rbp)
000000000040c524	leaq	0x13f0(%r14), %rdi
000000000040c52b	xorpd	%xmm0, %xmm0
000000000040c52f	movq	%r13, %rsi
000000000040c532	callq	0x6dfa9e                        ## symbol stub for: __ZNK9OZChannel16getValueAsDoubleERK6CMTimed
000000000040c537	movsd	%xmm0, -0x70(%rbp)
000000000040c53c	leaq	0x1488(%r14), %rdi
000000000040c543	xorpd	%xmm0, %xmm0
000000000040c547	movq	%r13, %rsi
000000000040c54a	callq	0x6dfa9e                        ## symbol stub for: __ZNK9OZChannel16getValueAsDoubleERK6CMTimed
000000000040c54f	movsd	%xmm0, -0xc0(%rbp)
000000000040c557	leaq	0x1520(%r14), %rdi
000000000040c55e	xorpd	%xmm0, %xmm0
000000000040c562	movq	%r13, %rsi
000000000040c565	callq	0x6dfa9e                        ## symbol stub for: __ZNK9OZChannel16getValueAsDoubleERK6CMTimed
000000000040c56a	movsd	%xmm0, -0xc8(%rbp)
000000000040c572	leaq	0x15b8(%r14), %rdi
000000000040c579	xorpd	%xmm0, %xmm0
000000000040c57d	movq	%r13, %rsi
000000000040c580	callq	0x6dfa9e                        ## symbol stub for: __ZNK9OZChannel16getValueAsDoubleERK6CMTimed
000000000040c585	movapd	%xmm0, -0x220(%rbp)
000000000040c58d	movq	%rbx, %rdi
000000000040c590	movq	%r13, %rsi
000000000040c593	callq	__ZN21OZMotionPathCurveNode9getLengthERK6CMTime ## OZMotionPathCurveNode::getLength(CMTime const&)
000000000040c598	movapd	0x2fa870(%rip), %xmm2
000000000040c5a0	andpd	%xmm0, %xmm2
000000000040c5a4	movsd	0x2fa924(%rip), %xmm1
000000000040c5ac	ucomisd	%xmm2, %xmm1
000000000040c5b0	xorpd	%xmm1, %xmm1
000000000040c5b4	ja	0x40c5bf
000000000040c5b6	movapd	-0x50(%rbp), %xmm1
000000000040c5bb	divsd	%xmm0, %xmm1
000000000040c5bf	movapd	%xmm0, -0x110(%rbp)
000000000040c5c7	movapd	%xmm1, -0x50(%rbp)
000000000040c5cc	leaq	0x1850(%r14), %rdi
000000000040c5d3	movq	0x417f36(%rip), %r15            ## literal pool symbol address: _kCMTimeZero
000000000040c5da	xorpd	%xmm0, %xmm0
000000000040c5de	movq	%r15, %rsi
000000000040c5e1	callq	0x6dfa80                        ## symbol stub for: __ZNK9OZChannel13getValueAsIntERK6CMTimed
000000000040c5e6	movsd	0x2f8df2(%rip), %xmm0
000000000040c5ee	cmpl	$0x1, %eax
000000000040c5f1	jne	0x40c5fd
000000000040c5f3	subsd	-0x50(%rbp), %xmm0
000000000040c5f8	movapd	%xmm0, -0x50(%rbp)
000000000040c5fd	movapd	-0x40(%rbp), %xmm1
000000000040c602	movapd	-0x60(%rbp), %xmm2
000000000040c607	xorl	%eax, %eax
000000000040c609	xorpd	%xmm0, %xmm0
000000000040c60d	movapd	-0x110(%rbp), %xmm3
000000000040c615	ucomisd	%xmm0, %xmm3
000000000040c619	seta	%al
000000000040c61c	movapd	0x2faf3c(%rip), %xmm0
000000000040c624	xorpd	%xmm2, %xmm0
000000000040c628	unpcklpd	%xmm1, %xmm0                    ## xmm0 = xmm0[0],xmm1[0]
000000000040c62c	movddup	%xmm3, %xmm1                    ## xmm1 = xmm3[0,0]
000000000040c630	divpd	%xmm1, %xmm0
000000000040c634	movd	%eax, %xmm1
000000000040c638	pshufd	$0x0, %xmm1, %xmm1              ## xmm1 = xmm1[0,0,0,0]
000000000040c63d	pslld	$0x1f, %xmm1
000000000040c642	psrad	$0x1f, %xmm1
000000000040c647	pand	%xmm0, %xmm1
000000000040c64b	movdqa	%xmm1, -0x110(%rbp)
000000000040c653	leaq	0x1950(%r14), %rdi
000000000040c65a	xorpd	%xmm0, %xmm0
000000000040c65e	movq	%r15, %rsi
000000000040c661	callq	0x6dfa80                        ## symbol stub for: __ZNK9OZChannel13getValueAsIntERK6CMTimed
000000000040c666	cmpl	$0x8, %eax
000000000040c669	jne	0x40cab9
000000000040c66f	movapd	0x2faee9(%rip), %xmm2
000000000040c677	movapd	-0x220(%rbp), %xmm0
000000000040c67f	orpd	%xmm0, %xmm2
000000000040c683	movapd	-0x50(%rbp), %xmm4
000000000040c688	movsd	0x2f8d50(%rip), %xmm3
000000000040c690	subsd	%xmm4, %xmm3
000000000040c694	pxor	%xmm1, %xmm1
000000000040c698	cmpltsd	%xmm1, %xmm0
000000000040c69d	movapd	%xmm4, %xmm1
000000000040c6a1	blendvpd	%xmm0, %xmm3, %xmm1
000000000040c6a6	mulsd	%xmm2, %xmm1
000000000040c6aa	movapd	%xmm1, %xmm0
000000000040c6ae	callq	0x6dfde0                        ## symbol stub for: _exp
000000000040c6b3	movsd	-0x70(%rbp), %xmm1
000000000040c6b8	mulsd	%xmm0, %xmm1
000000000040c6bc	movsd	%xmm1, -0x70(%rbp)
000000000040c6c1	movsd	0x2fb087(%rip), %xmm0
000000000040c6c9	mulsd	-0x50(%rbp), %xmm0
000000000040c6ce	movsd	-0xc0(%rbp), %xmm1
000000000040c6d6	mulsd	%xmm0, %xmm1
000000000040c6da	movsd	-0xc8(%rbp), %xmm0
000000000040c6e2	addsd	%xmm1, %xmm0
000000000040c6e6	callq	0x6e00da                        ## symbol stub for: _sin
000000000040c6eb	mulsd	-0x70(%rbp), %xmm0
000000000040c6f0	movapd	-0x40(%rbp), %xmm2
000000000040c6f5	unpcklpd	-0x60(%rbp), %xmm2              ## xmm2 = xmm2[0],mem[0]
000000000040c6fa	movddup	-0x50(%rbp), %xmm1              ## xmm1 = mem[0,0]
000000000040c6ff	mulpd	%xmm2, %xmm1
000000000040c703	xorpd	%xmm2, %xmm2
000000000040c707	addpd	%xmm1, %xmm2
000000000040c70b	movddup	%xmm0, %xmm0                    ## xmm0 = xmm0[0,0]
000000000040c70f	movapd	-0x110(%rbp), %xmm1
000000000040c717	mulpd	%xmm0, %xmm1
000000000040c71b	addpd	%xmm2, %xmm1
000000000040c71f	movapd	%xmm1, %xmm2
000000000040c723	movl	0x1c(%rbx), %eax
000000000040c726	cmpl	$0x2, %eax
000000000040c729	movsd	-0x78(%rbp), %xmm1
000000000040c72e	jne	0x40cc55
000000000040c734	jmp	0x40cbde
000000000040c739	leaq	0x1650(%r14), %rdi
000000000040c740	callq	__ZNK25OZChanObjectRefWithPicker7getNodeEv ## OZChanObjectRefWithPicker::getNode() const
000000000040c745	testq	%rax, %rax
000000000040c748	je	0x40c8f2
000000000040c74e	leaq	__ZTI11OZSceneNode(%rip), %rsi  ## typeinfo for OZSceneNode
000000000040c755	leaq	__ZTI11OZRotoshape(%rip), %rdx  ## typeinfo for OZRotoshape
000000000040c75c	movl	$0xc8, %ecx
000000000040c761	movq	%rax, %rdi
000000000040c764	callq	0x6dfd0e                        ## symbol stub for: ___dynamic_cast
000000000040c769	testq	%rax, %rax
000000000040c76c	xorpd	%xmm0, %xmm0
000000000040c770	je	0x40c4e2
000000000040c776	movq	%rax, -0x60(%rbp)
000000000040c77a	leaq	-0x330(%rbp), %rdi
000000000040c781	callq	__ZN13OZRenderStateC1Ev         ## OZRenderState::OZRenderState()
000000000040c786	movq	0x10(%r13), %rax
000000000040c78a	movq	%rax, -0x320(%rbp)
000000000040c791	movups	(%r13), %xmm0
000000000040c796	movaps	%xmm0, -0x330(%rbp)
000000000040c79d	leaq	0x1720(%r14), %rdi
000000000040c7a4	xorps	%xmm0, %xmm0
000000000040c7a7	movq	%r13, %rsi
000000000040c7aa	callq	0x6dfa9e                        ## symbol stub for: __ZNK9OZChannel16getValueAsDoubleERK6CMTimed
000000000040c7af	movaps	%xmm0, -0x70(%rbp)
000000000040c7b3	movq	$0x0, -0xb0(%rbp)
000000000040c7be	movq	$0x0, -0xd0(%rbp)
000000000040c7c9	leaq	0x1950(%r14), %rdi
000000000040c7d0	movq	0x417d39(%rip), %rsi            ## literal pool symbol address: _kCMTimeZero
000000000040c7d7	xorps	%xmm0, %xmm0
000000000040c7da	callq	0x6dfa80                        ## symbol stub for: __ZNK9OZChannel13getValueAsIntERK6CMTimed
000000000040c7df	cmpl	$0x8, %eax
000000000040c7e2	jne	0x40c821
000000000040c7e4	movq	-0x60(%rbp), %rax
000000000040c7e8	leaq	0x4e48(%rax), %r15
000000000040c7ef	movq	0x417d1a(%rip), %rsi            ## literal pool symbol address: _kCMTimeZero
000000000040c7f6	xorps	%xmm0, %xmm0
000000000040c7f9	movq	%r15, %rdi
000000000040c7fc	callq	0x6dfa80                        ## symbol stub for: __ZNK9OZChannel13getValueAsIntERK6CMTimed
000000000040c801	cmpl	$0x3, %eax
000000000040c804	je	0x40c821
000000000040c806	movq	0x417d03(%rip), %rsi            ## literal pool symbol address: _kCMTimeZero
000000000040c80d	xorps	%xmm0, %xmm0
000000000040c810	movq	%r15, %rdi
000000000040c813	callq	0x6dfa80                        ## symbol stub for: __ZNK9OZChannel13getValueAsIntERK6CMTimed
000000000040c818	cmpl	$0x2, %eax
000000000040c81b	jne	0x40d375
000000000040c821	movl	$0x1, 0x10(%rsp)
000000000040c829	movq	$0x0, 0x8(%rsp)
000000000040c832	movl	$0x1, (%rsp)
000000000040c839	leaq	-0x330(%rbp), %rsi
000000000040c840	leaq	-0xb0(%rbp), %rdx
000000000040c847	leaq	-0xd0(%rbp), %rcx
000000000040c84e	xorps	%xmm0, %xmm0
000000000040c851	movq	-0x60(%rbp), %r15
000000000040c855	movq	%r15, %rdi
000000000040c858	xorl	%r8d, %r8d
000000000040c85b	xorl	%r9d, %r9d
000000000040c85e	callq	__ZN11OZRotoshape31getReparametrizedPointOnContourERK13OZRenderStatedPdS3_S3_S3_bP14PCMatrix44TmplIdEb ## OZRotoshape::getReparametrizedPointOnContour(OZRenderState const&, double, double*, double*, double*, double*, bool, PCMatrix44Tmpl<double>*, bool)
000000000040c863	leaq	0x4f48(%r15), %rdi
000000000040c86a	movq	0x417c9f(%rip), %rsi            ## literal pool symbol address: _kCMTimeZero
000000000040c871	xorps	%xmm0, %xmm0
000000000040c874	callq	0x6dfa80                        ## symbol stub for: __ZNK9OZChannel13getValueAsIntERK6CMTimed
000000000040c879	testl	%eax, %eax
000000000040c87b	je	0x40cd06
000000000040c881	leaq	0x1850(%r14), %rdi
000000000040c888	movq	0x417c81(%rip), %rsi            ## literal pool symbol address: _kCMTimeZero
000000000040c88f	xorps	%xmm0, %xmm0
000000000040c892	callq	0x6dfa80                        ## symbol stub for: __ZNK9OZChannel13getValueAsIntERK6CMTimed
000000000040c897	movapd	-0x50(%rbp), %xmm0
000000000040c89c	movsd	-0x40(%rbp), %xmm3
000000000040c8a1	divsd	%xmm3, %xmm0
000000000040c8a5	addsd	-0x70(%rbp), %xmm0
000000000040c8aa	roundsd	$0xb, %xmm0, %xmm2
000000000040c8b0	movapd	%xmm0, %xmm1
000000000040c8b4	subsd	%xmm2, %xmm1
000000000040c8b8	andpd	0x2fa550(%rip), %xmm1
000000000040c8c0	andpd	0x2fac98(%rip), %xmm0
000000000040c8c8	orpd	%xmm1, %xmm0
000000000040c8cc	cmpl	$0x1, %eax
000000000040c8cf	jne	0x40cdda
000000000040c8d5	movsd	0x2f8b03(%rip), %xmm1
000000000040c8dd	subsd	%xmm0, %xmm1
000000000040c8e1	mulsd	%xmm3, %xmm1
000000000040c8e5	divsd	%xmm3, %xmm1
000000000040c8e9	movapd	%xmm1, %xmm0
000000000040c8ed	jmp	0x40cdda
000000000040c8f2	xorpd	%xmm0, %xmm0
000000000040c8f6	jmp	0x40c4e2
000000000040c8fb	movq	0x8(%rbx), %rdi
000000000040c8ff	movq	(%rdi), %rax
000000000040c902	callq	*0x150(%rax)
000000000040c908	movsd	0x2f8ad0(%rip), %xmm0
000000000040c910	divsd	0xc0(%rax), %xmm0
000000000040c918	movsd	%xmm0, -0x40(%rbp)
000000000040c91d	leaq	0xd40(%r14), %r15
000000000040c924	xorpd	%xmm0, %xmm0
000000000040c928	movq	%r15, %rdi
000000000040c92b	movq	%r13, %rsi
000000000040c92e	callq	0x6dfa9e                        ## symbol stub for: __ZNK9OZChannel16getValueAsDoubleERK6CMTimed
000000000040c933	andpd	0x2fa4d5(%rip), %xmm0
000000000040c93b	mulsd	-0x40(%rbp), %xmm0
000000000040c940	movapd	%xmm0, -0x40(%rbp)
000000000040c945	leaq	0xdd8(%r14), %r12
000000000040c94c	xorpd	%xmm0, %xmm0
000000000040c950	movq	%r12, %rdi
000000000040c953	movq	%r13, %rsi
000000000040c956	callq	0x6dfa9e                        ## symbol stub for: __ZNK9OZChannel16getValueAsDoubleERK6CMTimed
000000000040c95b	andpd	0x2fa4ad(%rip), %xmm0
000000000040c963	movapd	%xmm0, -0x60(%rbp)
000000000040c968	movq	%rbx, %rdi
000000000040c96b	movq	%r13, %rsi
000000000040c96e	callq	__ZN21OZMotionPathCurveNode9getLengthERK6CMTime ## OZMotionPathCurveNode::getLength(CMTime const&)
000000000040c973	movapd	%xmm0, -0x70(%rbp)
000000000040c978	leaq	0x1720(%r14), %rdi
000000000040c97f	xorpd	%xmm0, %xmm0
000000000040c983	movq	%r13, %rsi
000000000040c986	callq	0x6dfa9e                        ## symbol stub for: __ZNK9OZChannel16getValueAsDoubleERK6CMTimed
000000000040c98b	movapd	-0x60(%rbp), %xmm4
000000000040c990	movapd	0x2fa478(%rip), %xmm2
000000000040c998	andpd	-0x70(%rbp), %xmm2
000000000040c99d	movsd	0x2fa52b(%rip), %xmm1
000000000040c9a5	ucomisd	%xmm2, %xmm1
000000000040c9a9	xorpd	%xmm6, %xmm6
000000000040c9ad	ja	0x40ca43
000000000040c9b3	movsd	%xmm0, -0xc0(%rbp)
000000000040c9bb	addq	$0x1850, %r14                   ## imm = 0x1850
000000000040c9c2	movq	0x417b47(%rip), %rsi            ## literal pool symbol address: _kCMTimeZero
000000000040c9c9	xorpd	%xmm0, %xmm0
000000000040c9cd	movq	%r14, %rdi
000000000040c9d0	callq	0x6dfa80                        ## symbol stub for: __ZNK9OZChannel13getValueAsIntERK6CMTimed
000000000040c9d5	cmpl	$0x1, %eax
000000000040c9d8	jne	0x40cc75
000000000040c9de	movapd	-0x40(%rbp), %xmm0
000000000040c9e3	addsd	%xmm0, %xmm0
000000000040c9e7	movapd	-0x60(%rbp), %xmm4
000000000040c9ec	movapd	%xmm4, %xmm1
000000000040c9f0	addsd	%xmm4, %xmm1
000000000040c9f4	addsd	%xmm0, %xmm1
000000000040c9f8	movapd	-0x50(%rbp), %xmm3
000000000040c9fd	divsd	-0x70(%rbp), %xmm3
000000000040ca02	addsd	-0xc0(%rbp), %xmm3
000000000040ca0a	xorps	%xmm0, %xmm0
000000000040ca0d	roundsd	$0xb, %xmm3, %xmm0
000000000040ca13	movapd	%xmm3, %xmm2
000000000040ca17	subsd	%xmm0, %xmm2
000000000040ca1b	andpd	0x2fa3ed(%rip), %xmm2
000000000040ca23	andpd	0x2fab35(%rip), %xmm3
000000000040ca2b	orpd	%xmm2, %xmm3
000000000040ca2f	movsd	0x2f89a9(%rip), %xmm0
000000000040ca37	subsd	%xmm3, %xmm0
000000000040ca3b	mulsd	%xmm1, %xmm0
000000000040ca3f	movapd	%xmm0, %xmm6
000000000040ca43	movsd	0x2fa45d(%rip), %xmm5
000000000040ca4b	mulsd	%xmm4, %xmm5
000000000040ca4f	ucomisd	%xmm6, %xmm5
000000000040ca53	jae	0x40cce0
000000000040ca59	movapd	-0x40(%rbp), %xmm3
000000000040ca5e	movapd	%xmm3, %xmm1
000000000040ca62	addsd	%xmm5, %xmm1
000000000040ca66	ucomisd	%xmm6, %xmm1
000000000040ca6a	jae	0x40ccf3
000000000040ca70	movsd	0x2fa460(%rip), %xmm1
000000000040ca78	mulsd	%xmm4, %xmm1
000000000040ca7c	mulsd	0x2fa424(%rip), %xmm1
000000000040ca84	movapd	%xmm3, %xmm2
000000000040ca88	addsd	%xmm1, %xmm2
000000000040ca8c	ucomisd	%xmm6, %xmm2
000000000040ca90	jae	0x40cd5d
000000000040ca96	movapd	%xmm3, %xmm2
000000000040ca9a	addsd	%xmm3, %xmm2
000000000040ca9e	addsd	%xmm1, %xmm2
000000000040caa2	ucomisd	%xmm6, %xmm2
000000000040caa6	jae	0x40cfba
000000000040caac	subsd	%xmm2, %xmm6
000000000040cab0	subsd	%xmm5, %xmm6
000000000040cab4	jmp	0x40cce0
000000000040cab9	movq	$0x0, -0x100(%rbp)
000000000040cac4	movq	$0x0, -0xb0(%rbp)
000000000040cacf	movq	0x8(%rbx), %rdi
000000000040cad3	movq	(%rdi), %rax
000000000040cad6	callq	*0x150(%rax)
000000000040cadc	leaq	0x90(%rax), %rsi
000000000040cae3	leaq	-0x210(%rbp), %r15
000000000040caea	movq	%r15, %rdi
000000000040caed	callq	__ZNK15OZSceneSettings16getFrameDurationEv ## OZSceneSettings::getFrameDuration() const
000000000040caf2	movq	(%r14), %rax
000000000040caf5	leaq	-0x330(%rbp), %rdi
000000000040cafc	movq	%r14, %rsi
000000000040caff	callq	*0x268(%rax)
000000000040cb05	movq	-0x308(%rbp), %rax
000000000040cb0c	movq	%rax, -0x90(%rbp)
000000000040cb13	movups	-0x318(%rbp), %xmm0
000000000040cb1a	movaps	%xmm0, -0xa0(%rbp)
000000000040cb21	leaq	-0x190(%rbp), %rdi
000000000040cb28	leaq	-0xa0(%rbp), %rsi
000000000040cb2f	movq	%r15, %rdx
000000000040cb32	callq	0x6dfc42                        ## symbol stub for: __ZdvRK6CMTimeS1_
000000000040cb37	movq	-0x180(%rbp), %rax
000000000040cb3e	movq	%rax, 0x10(%rsp)
000000000040cb43	movupd	-0x190(%rbp), %xmm0
000000000040cb4b	movupd	%xmm0, (%rsp)
000000000040cb50	callq	0x6dcac2                        ## symbol stub for: _CMTimeGetSeconds
000000000040cb55	leaq	0x28(%rbx), %rdi
000000000040cb59	cvttsd2si	%xmm0, %esi
000000000040cb5d	leaq	-0x100(%rbp), %rdx
000000000040cb64	leaq	-0xb0(%rbp), %rcx
000000000040cb6b	movaps	-0x50(%rbp), %xmm0
000000000040cb6f	movsd	-0x70(%rbp), %xmm1
000000000040cb74	movsd	-0xc0(%rbp), %xmm2
000000000040cb7c	movsd	-0xc8(%rbp), %xmm3
000000000040cb84	movapd	-0x220(%rbp), %xmm4
000000000040cb8c	movapd	-0x40(%rbp), %xmm5
000000000040cb91	movapd	-0x60(%rbp), %xmm6
000000000040cb96	callq	0x6dd60e                        ## symbol stub for: __ZN11PCEvaluator19findPointOnSineWaveEdddddddiPdS0_
000000000040cb9b	movapd	-0x40(%rbp), %xmm1
000000000040cba0	unpcklpd	-0x60(%rbp), %xmm1              ## xmm1 = xmm1[0],mem[0]
000000000040cba5	movddup	-0x100(%rbp), %xmm0             ## xmm0 = mem[0,0]
000000000040cbad	mulpd	%xmm1, %xmm0
000000000040cbb1	xorpd	%xmm1, %xmm1
000000000040cbb5	addpd	%xmm0, %xmm1
000000000040cbb9	movddup	-0xb0(%rbp), %xmm0              ## xmm0 = mem[0,0]
000000000040cbc1	movapd	-0x110(%rbp), %xmm2
000000000040cbc9	mulpd	%xmm0, %xmm2
000000000040cbcd	addpd	%xmm1, %xmm2
000000000040cbd1	movl	0x1c(%rbx), %eax
000000000040cbd4	cmpl	$0x2, %eax
000000000040cbd7	movsd	-0x78(%rbp), %xmm1
000000000040cbdc	jne	0x40cc55
000000000040cbde	unpckhpd	%xmm2, %xmm2                    ## xmm2 = xmm2[1,1]
000000000040cbe2	jmp	0x40cc62
000000000040cbe4	leaq	0x28(%rbx), %rdi
000000000040cbe8	movaps	0x2fa221(%rip), %xmm2
000000000040cbef	movaps	-0x40(%rbp), %xmm1
000000000040cbf3	andps	%xmm2, %xmm1
000000000040cbf6	andps	-0xc0(%rbp), %xmm2
000000000040cbfd	leaq	-0xa8(%rbp), %rsi
000000000040cc04	leaq	-0x80(%rbp), %rdx
000000000040cc08	xorpd	%xmm3, %xmm3
000000000040cc0c	xorpd	%xmm4, %xmm4
000000000040cc10	movsd	-0x60(%rbp), %xmm0
000000000040cc15	xorl	%ecx, %ecx
000000000040cc17	callq	0x6dd602                        ## symbol stub for: __ZN11PCEvaluator18findPointOnEllipseEdddddPdS0_S0_
000000000040cc1c	xorpd	%xmm0, %xmm0
000000000040cc20	movapd	-0x40(%rbp), %xmm2
000000000040cc25	ucomisd	%xmm2, %xmm0
000000000040cc29	jbe	0x40cc32
000000000040cc2b	xorb	$-0x80, -0xa1(%rbp)
000000000040cc32	ucomisd	-0xc0(%rbp), %xmm0
000000000040cc3a	movsd	-0x78(%rbp), %xmm1
000000000040cc3f	jbe	0x40cc45
000000000040cc41	xorb	$-0x80, -0x79(%rbp)
000000000040cc45	addsd	-0xa8(%rbp), %xmm2
000000000040cc4d	movl	0x1c(%rbx), %eax
000000000040cc50	cmpl	$0x2, %eax
000000000040cc53	je	0x40cc6b
000000000040cc55	xorpd	%xmm0, %xmm0
000000000040cc59	cmpl	$0x1, %eax
000000000040cc5c	jne	0x40c4da
000000000040cc62	movapd	%xmm2, %xmm0
000000000040cc66	jmp	0x40c4da
000000000040cc6b	movsd	-0x80(%rbp), %xmm0
000000000040cc70	jmp	0x40c4da
000000000040cc75	movapd	-0x50(%rbp), %xmm2
000000000040cc7a	divsd	-0x70(%rbp), %xmm2
000000000040cc7f	addsd	-0xc0(%rbp), %xmm2
000000000040cc87	xorps	%xmm0, %xmm0
000000000040cc8a	roundsd	$0xb, %xmm2, %xmm0
000000000040cc90	movapd	%xmm2, %xmm1
000000000040cc94	subsd	%xmm0, %xmm1
000000000040cc98	andpd	0x2fa170(%rip), %xmm1
000000000040cca0	andpd	0x2fa8b8(%rip), %xmm2
000000000040cca8	orpd	%xmm1, %xmm2
000000000040ccac	movapd	-0x40(%rbp), %xmm1
000000000040ccb1	addsd	%xmm1, %xmm1
000000000040ccb5	movapd	-0x60(%rbp), %xmm4
000000000040ccba	movapd	%xmm4, %xmm6
000000000040ccbe	addsd	%xmm4, %xmm6
000000000040ccc2	addsd	%xmm1, %xmm6
000000000040ccc6	mulsd	%xmm2, %xmm6
000000000040ccca	movsd	0x2fa1d6(%rip), %xmm5
000000000040ccd2	mulsd	%xmm4, %xmm5
000000000040ccd6	ucomisd	%xmm6, %xmm5
000000000040ccda	jb	0x40ca59
000000000040cce0	movapd	%xmm6, -0x50(%rbp)
000000000040cce5	xorpd	%xmm0, %xmm0
000000000040cce9	movapd	%xmm0, -0x40(%rbp)
000000000040ccee	jmp	0x40cfd8
000000000040ccf3	movapd	%xmm5, -0x50(%rbp)
000000000040ccf8	subsd	%xmm5, %xmm6
000000000040ccfc	movapd	%xmm6, -0x40(%rbp)
000000000040cd01	jmp	0x40cfd8
000000000040cd06	movapd	-0x50(%rbp), %xmm3
000000000040cd0b	divsd	-0x40(%rbp), %xmm3
000000000040cd10	addsd	-0x70(%rbp), %xmm3
000000000040cd15	movapd	0x2fa0f3(%rip), %xmm1
000000000040cd1d	andpd	%xmm3, %xmm1
000000000040cd21	movsd	0x2fa1a7(%rip), %xmm0
000000000040cd29	ucomisd	%xmm1, %xmm0
000000000040cd2d	ja	0x40cd73
000000000040cd2f	xorps	%xmm1, %xmm1
000000000040cd32	roundsd	$0x9, %xmm3, %xmm1
000000000040cd38	movapd	%xmm3, %xmm2
000000000040cd3c	subsd	%xmm1, %xmm2
000000000040cd40	andpd	0x2fa0c8(%rip), %xmm2
000000000040cd48	ucomisd	%xmm2, %xmm0
000000000040cd4c	jbe	0x40cd73
000000000040cd4e	movsd	0x2f868a(%rip), %xmm0
000000000040cd56	movapd	%xmm0, -0x50(%rbp)
000000000040cd5b	jmp	0x40cd9d
000000000040cd5d	subsd	%xmm3, %xmm6
000000000040cd61	subsd	%xmm5, %xmm6
000000000040cd65	subsd	%xmm6, %xmm5
000000000040cd69	movapd	%xmm5, -0x50(%rbp)
000000000040cd6e	jmp	0x40cfd8
000000000040cd73	xorps	%xmm0, %xmm0
000000000040cd76	roundsd	$0xb, %xmm3, %xmm0
000000000040cd7c	movapd	%xmm3, %xmm1
000000000040cd80	subsd	%xmm0, %xmm1
000000000040cd84	andpd	0x2fa084(%rip), %xmm1
000000000040cd8c	andpd	0x2fa7cc(%rip), %xmm3
000000000040cd94	orpd	%xmm1, %xmm3
000000000040cd98	movapd	%xmm3, -0x50(%rbp)
000000000040cd9d	leaq	0x1850(%r14), %rdi
000000000040cda4	movq	0x417765(%rip), %rsi            ## literal pool symbol address: _kCMTimeZero
000000000040cdab	xorpd	%xmm0, %xmm0
000000000040cdaf	callq	0x6dfa80                        ## symbol stub for: __ZNK9OZChannel13getValueAsIntERK6CMTimed
000000000040cdb4	cmpl	$0x1, %eax
000000000040cdb7	jne	0x40cdd5
000000000040cdb9	movsd	0x2f861f(%rip), %xmm0
000000000040cdc1	subsd	-0x50(%rbp), %xmm0
000000000040cdc6	movsd	-0x40(%rbp), %xmm1
000000000040cdcb	mulsd	%xmm1, %xmm0
000000000040cdcf	divsd	%xmm1, %xmm0
000000000040cdd3	jmp	0x40cdda
000000000040cdd5	movapd	-0x50(%rbp), %xmm0
000000000040cdda	movl	$0x1, 0x10(%rsp)
000000000040cde2	movq	$0x0, 0x8(%rsp)
000000000040cdeb	movl	$0x1, (%rsp)
000000000040cdf2	leaq	-0x330(%rbp), %rsi
000000000040cdf9	leaq	-0xa8(%rbp), %rdx
000000000040ce00	leaq	-0x80(%rbp), %rcx
000000000040ce04	movq	%r15, %rdi
000000000040ce07	xorl	%r8d, %r8d
000000000040ce0a	xorl	%r9d, %r9d
000000000040ce0d	callq	__ZN11OZRotoshape31getReparametrizedPointOnContourERK13OZRenderStatedPdS3_S3_S3_bP14PCMatrix44TmplIdEb ## OZRotoshape::getReparametrizedPointOnContour(OZRenderState const&, double, double*, double*, double*, double*, bool, PCMatrix44Tmpl<double>*, bool)
000000000040ce12	leaq	0x17b8(%r14), %rdi
000000000040ce19	movq	0x4176f0(%rip), %r13            ## literal pool symbol address: _kCMTimeZero
000000000040ce20	xorpd	%xmm0, %xmm0
000000000040ce24	movq	%r13, %rsi
000000000040ce27	callq	0x6dfa80                        ## symbol stub for: __ZNK9OZChannel13getValueAsIntERK6CMTimed
000000000040ce2c	testl	%eax, %eax
000000000040ce2e	je	0x40cf8b
000000000040ce34	movq	0x10(%r12), %rax
000000000040ce39	movq	%rax, -0x90(%rbp)
000000000040ce40	movups	(%r12), %xmm0
000000000040ce45	movaps	%xmm0, -0xa0(%rbp)
000000000040ce4c	movq	0x10(%r12), %rax
000000000040ce51	movq	%rax, -0x200(%rbp)
000000000040ce58	movups	(%r12), %xmm0
000000000040ce5d	movaps	%xmm0, -0x210(%rbp)
000000000040ce64	movq	0x10(%r13), %rax
000000000040ce68	movq	%rax, -0x180(%rbp)
000000000040ce6f	movups	(%r13), %xmm0
000000000040ce74	movaps	%xmm0, -0x190(%rbp)
000000000040ce7b	movq	-0x180(%rbp), %rax
000000000040ce82	movq	%rax, 0x28(%rsp)
000000000040ce87	movaps	-0x190(%rbp), %xmm0
000000000040ce8e	movups	%xmm0, 0x18(%rsp)
000000000040ce93	movq	-0x200(%rbp), %rax
000000000040ce9a	movq	%rax, 0x10(%rsp)
000000000040ce9f	movaps	-0x210(%rbp), %xmm0
000000000040cea6	movups	%xmm0, (%rsp)
000000000040ceaa	callq	0x6dcab0                        ## symbol stub for: _CMTimeCompare
000000000040ceaf	testl	%eax, %eax
000000000040ceb1	js	0x40d084
000000000040ceb7	movq	0x8(%rbx), %rsi
000000000040cebb	leaq	-0x190(%rbp), %rdi
000000000040cec2	callq	__ZNK10OZBehavior16getFrameDurationEv ## OZBehavior::getFrameDuration() const
000000000040cec7	movq	(%r14), %rax
000000000040ceca	leaq	-0x210(%rbp), %rdi
000000000040ced1	movq	%r14, %rsi
000000000040ced4	callq	*0x268(%rax)
000000000040ceda	movq	-0x200(%rbp), %rax
000000000040cee1	movq	%rax, 0x28(%rsp)
000000000040cee6	movups	-0x210(%rbp), %xmm0
000000000040ceed	movups	%xmm0, 0x18(%rsp)
000000000040cef2	movq	-0x90(%rbp), %rax
000000000040cef9	movq	%rax, 0x10(%rsp)
000000000040cefe	movaps	-0xa0(%rbp), %xmm0
000000000040cf05	movups	%xmm0, (%rsp)
000000000040cf09	callq	0x6dcab0                        ## symbol stub for: _CMTimeCompare
000000000040cf0e	testl	%eax, %eax
000000000040cf10	js	0x40d068
000000000040cf16	leaq	-0x100(%rbp), %rdi
000000000040cf1d	leaq	-0x210(%rbp), %rsi
000000000040cf24	leaq	-0x190(%rbp), %rdx
000000000040cf2b	callq	__ZNK11PCTimeRange6getEndERK6CMTime ## PCTimeRange::getEnd(CMTime const&) const
000000000040cf30	movq	-0xf0(%rbp), %rax
000000000040cf37	movq	%rax, 0x28(%rsp)
000000000040cf3c	movups	-0x100(%rbp), %xmm0
000000000040cf43	movups	%xmm0, 0x18(%rsp)
000000000040cf48	movq	-0x90(%rbp), %rax
000000000040cf4f	movq	%rax, 0x10(%rsp)
000000000040cf54	movaps	-0xa0(%rbp), %xmm0
000000000040cf5b	movups	%xmm0, (%rsp)
000000000040cf5f	callq	0x6dcab0                        ## symbol stub for: _CMTimeCompare
000000000040cf64	testl	%eax, %eax
000000000040cf66	jle	0x40d084
000000000040cf6c	leaq	-0xa0(%rbp), %rdi
000000000040cf73	leaq	-0x210(%rbp), %rsi
000000000040cf7a	leaq	-0x190(%rbp), %rdx
000000000040cf81	callq	__ZNK11PCTimeRange6getEndERK6CMTime ## PCTimeRange::getEnd(CMTime const&) const
000000000040cf86	jmp	0x40d084
000000000040cf8b	movl	0x1c(%rbx), %eax
000000000040cf8e	cmpl	$0x2, %eax
000000000040cf91	je	0x40d363
000000000040cf97	cmpl	$0x1, %eax
000000000040cf9a	movsd	-0x78(%rbp), %xmm1
000000000040cf9f	jne	0x40d41e
000000000040cfa5	movsd	-0xa8(%rbp), %xmm0
000000000040cfad	subsd	-0xb0(%rbp), %xmm0
000000000040cfb5	jmp	0x40c4da
000000000040cfba	subsd	%xmm3, %xmm6
000000000040cfbe	subsd	%xmm1, %xmm6
000000000040cfc2	subsd	%xmm6, %xmm3
000000000040cfc6	movapd	%xmm3, -0x40(%rbp)
000000000040cfcb	mulsd	0x2fa74d(%rip), %xmm4
000000000040cfd3	movapd	%xmm4, -0x50(%rbp)
000000000040cfd8	xorpd	%xmm0, %xmm0
000000000040cfdc	movq	%r15, %rdi
000000000040cfdf	movq	%r13, %rsi
000000000040cfe2	callq	0x6dfa9e                        ## symbol stub for: __ZNK9OZChannel16getValueAsDoubleERK6CMTimed
000000000040cfe7	movapd	%xmm0, -0x60(%rbp)
000000000040cfec	xorpd	%xmm0, %xmm0
000000000040cff0	movq	%r12, %rdi
000000000040cff3	movq	%r13, %rsi
000000000040cff6	callq	0x6dfa9e                        ## symbol stub for: __ZNK9OZChannel16getValueAsDoubleERK6CMTimed
000000000040cffb	movl	0x1c(%rbx), %eax
000000000040cffe	cmpl	$0x2, %eax
000000000040d001	je	0x40d037
000000000040d003	cmpl	$0x1, %eax
000000000040d006	movsd	-0x78(%rbp), %xmm2
000000000040d00b	xorpd	%xmm3, %xmm3
000000000040d00f	jne	0x40d05b
000000000040d011	movapd	0x2fa547(%rip), %xmm1
000000000040d019	movapd	-0x40(%rbp), %xmm3
000000000040d01e	xorpd	%xmm3, %xmm1
000000000040d022	xorpd	%xmm4, %xmm4
000000000040d026	movapd	-0x60(%rbp), %xmm0
000000000040d02b	cmpltsd	%xmm4, %xmm0
000000000040d030	blendvpd	%xmm0, %xmm1, %xmm3
000000000040d035	jmp	0x40d05b
000000000040d037	movapd	0x2fa521(%rip), %xmm1
000000000040d03f	movapd	-0x50(%rbp), %xmm3
000000000040d044	xorpd	%xmm3, %xmm1
000000000040d048	xorpd	%xmm2, %xmm2
000000000040d04c	cmpltsd	%xmm2, %xmm0
000000000040d051	blendvpd	%xmm0, %xmm1, %xmm3
000000000040d056	movsd	-0x78(%rbp), %xmm2
000000000040d05b	addsd	%xmm3, %xmm2
000000000040d05f	movapd	%xmm2, %xmm0
000000000040d063	jmp	0x40c4e2
000000000040d068	movq	-0x200(%rbp), %rax
000000000040d06f	movq	%rax, -0x90(%rbp)
000000000040d076	movups	-0x210(%rbp), %xmm0
000000000040d07d	movaps	%xmm0, -0xa0(%rbp)
000000000040d084	movq	-0x90(%rbp), %rax
000000000040d08b	movq	%rax, -0x320(%rbp)
000000000040d092	movaps	-0xa0(%rbp), %xmm0
000000000040d099	movaps	%xmm0, -0x330(%rbp)
000000000040d0a0	movabsq	$0x3ff0000000000000, %rax       ## imm = 0x3FF0000000000000
000000000040d0aa	movq	%rax, -0x198(%rbp)
000000000040d0b1	movq	%rax, -0x1c0(%rbp)
000000000040d0b8	movq	%rax, -0x1e8(%rbp)
000000000040d0bf	movq	%rax, -0x210(%rbp)
000000000040d0c6	xorps	%xmm0, %xmm0
000000000040d0c9	movups	%xmm0, -0x208(%rbp)
000000000040d0d0	movups	%xmm0, -0x1f8(%rbp)
000000000040d0d7	movaps	%xmm0, -0x1e0(%rbp)
000000000040d0de	movaps	%xmm0, -0x1d0(%rbp)
000000000040d0e5	movups	%xmm0, -0x1b8(%rbp)
000000000040d0ec	movups	%xmm0, -0x1a8(%rbp)
000000000040d0f3	movq	%rax, -0x118(%rbp)
000000000040d0fa	movq	%rax, -0x140(%rbp)
000000000040d101	movq	%rax, -0x168(%rbp)
000000000040d108	movq	%rax, -0x190(%rbp)
000000000040d10f	movups	%xmm0, -0x188(%rbp)
000000000040d116	movups	%xmm0, -0x178(%rbp)
000000000040d11d	movups	%xmm0, -0x160(%rbp)
000000000040d124	movups	%xmm0, -0x150(%rbp)
000000000040d12b	movups	%xmm0, -0x138(%rbp)
000000000040d132	movups	%xmm0, -0x128(%rbp)
000000000040d139	movq	(%r14), %rax
000000000040d13c	movq	%r14, %rdi
000000000040d13f	callq	*0x140(%rax)
000000000040d145	cmpq	$0x0, 0x3b8(%rax)
000000000040d14d	je	0x40d191
000000000040d14f	movq	(%r14), %rax
000000000040d152	movq	%r14, %rdi
000000000040d155	callq	*0x140(%rax)
000000000040d15b	movq	0x3b8(%rax), %rdi
000000000040d162	leaq	__ZTI11OZSceneNode(%rip), %rsi  ## typeinfo for OZSceneNode
000000000040d169	leaq	__ZTI15OZTransformNode(%rip), %rdx ## typeinfo for OZTransformNode
000000000040d170	xorl	%ecx, %ecx
000000000040d172	callq	0x6dfd0e                        ## symbol stub for: ___dynamic_cast
000000000040d177	movq	(%rax), %rcx
000000000040d17a	leaq	-0x190(%rbp), %rsi
000000000040d181	leaq	-0x330(%rbp), %rdx
000000000040d188	movq	%rax, %rdi
000000000040d18b	callq	*0x508(%rcx)
000000000040d191	movq	%r15, %rdi
000000000040d194	addq	$0xc8, %rdi
000000000040d19b	movq	0xc8(%r15), %rax
000000000040d1a2	leaq	-0x210(%rbp), %rsi
000000000040d1a9	leaq	-0x330(%rbp), %rdx
000000000040d1b0	callq	*0x500(%rax)
000000000040d1b6	movapd	-0x1b0(%rbp), %xmm3
000000000040d1be	movapd	-0x1a0(%rbp), %xmm4
000000000040d1c6	movddup	-0xa8(%rbp), %xmm2              ## xmm2 = mem[0,0]
000000000040d1ce	movapd	-0x210(%rbp), %xmm5
000000000040d1d6	movapd	-0x200(%rbp), %xmm8
000000000040d1df	movapd	-0x1f0(%rbp), %xmm1
000000000040d1e7	movapd	-0x1e0(%rbp), %xmm0
000000000040d1ef	movapd	%xmm5, %xmm6
000000000040d1f3	unpcklpd	%xmm3, %xmm6                    ## xmm6 = xmm6[0],xmm3[0]
000000000040d1f7	mulpd	%xmm2, %xmm6
000000000040d1fb	movddup	-0x80(%rbp), %xmm7              ## xmm7 = mem[0,0]
000000000040d200	unpckhpd	%xmm3, %xmm5                    ## xmm5 = xmm5[1],xmm3[1]
000000000040d204	mulpd	%xmm7, %xmm5
000000000040d208	addpd	%xmm6, %xmm5
000000000040d20c	movapd	%xmm8, %xmm3
000000000040d211	unpcklpd	%xmm4, %xmm3                    ## xmm3 = xmm3[0],xmm4[0]
000000000040d215	xorpd	%xmm9, %xmm9
000000000040d21a	mulpd	%xmm9, %xmm3
000000000040d21f	addpd	%xmm5, %xmm3
000000000040d223	unpckhpd	%xmm4, %xmm8                    ## xmm8 = xmm8[1],xmm4[1]
000000000040d228	addpd	%xmm3, %xmm8
000000000040d22d	movapd	%xmm8, %xmm3
000000000040d232	unpckhpd	%xmm8, %xmm3                    ## xmm3 = xmm3[1],xmm8[1]
000000000040d237	divsd	%xmm3, %xmm8
000000000040d23c	movapd	-0x1c0(%rbp), %xmm4
000000000040d244	movapd	-0x1d0(%rbp), %xmm5
000000000040d24c	movapd	%xmm1, %xmm6
000000000040d250	unpcklpd	%xmm5, %xmm6                    ## xmm6 = xmm6[0],xmm5[0]
000000000040d254	mulpd	%xmm2, %xmm6
000000000040d258	unpckhpd	%xmm5, %xmm1                    ## xmm1 = xmm1[1],xmm5[1]
000000000040d25c	mulpd	%xmm7, %xmm1
000000000040d260	addpd	%xmm6, %xmm1
000000000040d264	movapd	%xmm0, %xmm2
000000000040d268	unpcklpd	%xmm4, %xmm2                    ## xmm2 = xmm2[0],xmm4[0]
000000000040d26c	mulpd	%xmm9, %xmm2
000000000040d271	addpd	%xmm1, %xmm2
000000000040d275	unpckhpd	%xmm4, %xmm0                    ## xmm0 = xmm0[1],xmm4[1]
000000000040d279	addpd	%xmm2, %xmm0
000000000040d27d	divpd	%xmm3, %xmm0
000000000040d281	movsd	-0x130(%rbp), %xmm1
000000000040d289	mulsd	%xmm8, %xmm1
000000000040d28e	movsd	-0x128(%rbp), %xmm2
000000000040d296	mulsd	%xmm0, %xmm2
000000000040d29a	addsd	%xmm1, %xmm2
000000000040d29e	movapd	%xmm0, %xmm1
000000000040d2a2	unpckhpd	%xmm0, %xmm1                    ## xmm1 = xmm1[1],xmm0[1]
000000000040d2a6	mulsd	-0x120(%rbp), %xmm1
000000000040d2ae	addsd	%xmm2, %xmm1
000000000040d2b2	addsd	-0x118(%rbp), %xmm1
000000000040d2ba	movl	0x1c(%rbx), %eax
000000000040d2bd	cmpl	$0x2, %eax
000000000040d2c0	je	0x40d2fb
000000000040d2c2	cmpl	$0x1, %eax
000000000040d2c5	jne	0x40d32f
000000000040d2c7	mulsd	-0x190(%rbp), %xmm8
000000000040d2d0	movupd	-0x188(%rbp), %xmm2
000000000040d2d8	mulpd	%xmm2, %xmm0
000000000040d2dc	addsd	%xmm0, %xmm8
000000000040d2e1	unpckhpd	%xmm0, %xmm0                    ## xmm0 = xmm0[1,1]
000000000040d2e5	addsd	%xmm8, %xmm0
000000000040d2ea	addsd	-0x178(%rbp), %xmm0
000000000040d2f2	divsd	%xmm1, %xmm0
000000000040d2f6	jmp	0x40c4e2
000000000040d2fb	mulsd	-0x170(%rbp), %xmm8
000000000040d304	movupd	-0x168(%rbp), %xmm2
000000000040d30c	mulpd	%xmm2, %xmm0
000000000040d310	addsd	%xmm0, %xmm8
000000000040d315	unpckhpd	%xmm0, %xmm0                    ## xmm0 = xmm0[1,1]
000000000040d319	addsd	%xmm8, %xmm0
000000000040d31e	addsd	-0x158(%rbp), %xmm0
000000000040d326	divsd	%xmm1, %xmm0
000000000040d32a	jmp	0x40c4e2
000000000040d32f	mulsd	-0x150(%rbp), %xmm8
000000000040d338	movupd	-0x148(%rbp), %xmm2
000000000040d340	mulpd	%xmm2, %xmm0
000000000040d344	addsd	%xmm0, %xmm8
000000000040d349	unpckhpd	%xmm0, %xmm0                    ## xmm0 = xmm0[1,1]
000000000040d34d	addsd	%xmm8, %xmm0
000000000040d352	addsd	-0x138(%rbp), %xmm0
000000000040d35a	divsd	%xmm1, %xmm0
000000000040d35e	jmp	0x40c4e2
000000000040d363	movsd	-0x80(%rbp), %xmm0
000000000040d368	subsd	-0xd0(%rbp), %xmm0
000000000040d370	jmp	0x40c4d5
000000000040d375	movapd	-0x50(%rbp), %xmm0
000000000040d37a	divsd	-0x40(%rbp), %xmm0
000000000040d37f	movapd	%xmm0, -0x50(%rbp)
000000000040d384	movq	-0x60(%rbp), %r15
000000000040d388	leaq	0x4ae8(%r15), %rdi
000000000040d38f	movq	%rdi, -0xc0(%rbp)
000000000040d396	movq	%r13, %rsi
000000000040d399	callq	0x6ddcfe                        ## symbol stub for: __ZN14OZChannelCurve18getParametricRangeERK6CMTime
000000000040d39e	movsd	%xmm0, -0x40(%rbp)
000000000040d3a3	leaq	0x4f48(%r15), %rdi
000000000040d3aa	movq	0x41715f(%rip), %rsi            ## literal pool symbol address: _kCMTimeZero
000000000040d3b1	xorpd	%xmm0, %xmm0
000000000040d3b5	callq	0x6dfa80                        ## symbol stub for: __ZNK9OZChannel13getValueAsIntERK6CMTimed
000000000040d3ba	testl	%eax, %eax
000000000040d3bc	je	0x40d427
000000000040d3be	leaq	0x1850(%r14), %rdi
000000000040d3c5	movq	0x417144(%rip), %rsi            ## literal pool symbol address: _kCMTimeZero
000000000040d3cc	xorpd	%xmm0, %xmm0
000000000040d3d0	callq	0x6dfa80                        ## symbol stub for: __ZNK9OZChannel13getValueAsIntERK6CMTimed
000000000040d3d5	cmpl	$0x1, %eax
000000000040d3d8	jne	0x40d47d
000000000040d3de	movapd	-0x50(%rbp), %xmm2
000000000040d3e3	addsd	-0x70(%rbp), %xmm2
000000000040d3e8	xorps	%xmm0, %xmm0
000000000040d3eb	roundsd	$0xb, %xmm2, %xmm0
000000000040d3f1	movapd	%xmm2, %xmm1
000000000040d3f5	subsd	%xmm0, %xmm1
000000000040d3f9	andpd	0x2f9a0f(%rip), %xmm1
000000000040d401	andpd	0x2fa157(%rip), %xmm2
000000000040d409	orpd	%xmm1, %xmm2
000000000040d40d	movsd	0x2f7fcb(%rip), %xmm0
000000000040d415	subsd	%xmm2, %xmm0
000000000040d419	jmp	0x40d4fe
000000000040d41e	xorpd	%xmm0, %xmm0
000000000040d422	jmp	0x40c4da
000000000040d427	movapd	-0x70(%rbp), %xmm4
000000000040d42c	movapd	-0x50(%rbp), %xmm0
000000000040d431	addsd	%xmm0, %xmm4
000000000040d435	movapd	0x2f99d3(%rip), %xmm1
000000000040d43d	andpd	%xmm4, %xmm1
000000000040d441	movsd	0x2f9a87(%rip), %xmm0
000000000040d449	ucomisd	%xmm1, %xmm0
000000000040d44d	ja	0x40d4a4
000000000040d44f	xorps	%xmm1, %xmm1
000000000040d452	roundsd	$0x9, %xmm4, %xmm1
000000000040d458	movapd	%xmm4, %xmm2
000000000040d45c	subsd	%xmm1, %xmm2
000000000040d460	andpd	0x2f99a8(%rip), %xmm2
000000000040d468	ucomisd	%xmm2, %xmm0
000000000040d46c	jbe	0x40d4a4
000000000040d46e	movsd	0x2f7f6a(%rip), %xmm0
000000000040d476	movapd	%xmm0, -0x70(%rbp)
000000000040d47b	jmp	0x40d4ce
000000000040d47d	movapd	-0x50(%rbp), %xmm2
000000000040d482	movsd	-0x40(%rbp), %xmm1
000000000040d487	mulsd	%xmm1, %xmm2
000000000040d48b	movapd	-0x70(%rbp), %xmm0
000000000040d490	mulsd	%xmm1, %xmm0
000000000040d494	addsd	%xmm2, %xmm0
000000000040d498	callq	0x6dfe1c                        ## symbol stub for: _fmod
000000000040d49d	movsd	%xmm0, -0x40(%rbp)
000000000040d4a2	jmp	0x40d50c
000000000040d4a4	xorps	%xmm0, %xmm0
000000000040d4a7	roundsd	$0xb, %xmm4, %xmm0
000000000040d4ad	movapd	%xmm4, %xmm1
000000000040d4b1	subsd	%xmm0, %xmm1
000000000040d4b5	andpd	0x2f9953(%rip), %xmm1
000000000040d4bd	andpd	0x2fa09b(%rip), %xmm4
000000000040d4c5	orpd	%xmm1, %xmm4
000000000040d4c9	movapd	%xmm4, -0x70(%rbp)
000000000040d4ce	leaq	0x1850(%r14), %rdi
000000000040d4d5	movq	0x417034(%rip), %rsi            ## literal pool symbol address: _kCMTimeZero
000000000040d4dc	xorpd	%xmm0, %xmm0
000000000040d4e0	callq	0x6dfa80                        ## symbol stub for: __ZNK9OZChannel13getValueAsIntERK6CMTimed
000000000040d4e5	cmpl	$0x1, %eax
000000000040d4e8	je	0x40d4f1
000000000040d4ea	movapd	-0x70(%rbp), %xmm0
000000000040d4ef	jmp	0x40d4fe
000000000040d4f1	movsd	0x2f7ee7(%rip), %xmm0
000000000040d4f9	subsd	-0x50(%rbp), %xmm0
000000000040d4fe	movsd	-0x40(%rbp), %xmm1
000000000040d503	mulsd	%xmm0, %xmm1
000000000040d507	movsd	%xmm1, -0x40(%rbp)
000000000040d50c	leaq	-0x330(%rbp), %r15
000000000040d513	leaq	-0xb0(%rbp), %rdx
000000000040d51a	leaq	-0xd0(%rbp), %rcx
000000000040d521	xorpd	%xmm0, %xmm0
000000000040d525	movq	-0xc0(%rbp), %r13
000000000040d52c	movq	%r13, %rdi
000000000040d52f	movq	%r15, %rsi
000000000040d532	callq	0x6ddd28                        ## symbol stub for: __ZN14OZChannelCurve26getCurveValueWithParameterERK6CMTimedPdS3_
000000000040d537	leaq	-0xa8(%rbp), %rdx
000000000040d53e	leaq	-0x80(%rbp), %rcx
000000000040d542	movq	%r13, %rdi
000000000040d545	movq	%r15, %rsi
000000000040d548	movsd	-0x40(%rbp), %xmm0
000000000040d54d	callq	0x6ddd28                        ## symbol stub for: __ZN14OZChannelCurve26getCurveValueWithParameterERK6CMTimedPdS3_
000000000040d552	movq	-0x60(%rbp), %r15
000000000040d556	jmp	0x40ce12
000000000040d55b	nop
000000000040d55c	cmpb	%ah, %ch
000000000040d55e	.byte 0xff #bad opcode
000000000040d55f	lcalll	*-0x6700000d(%rdi)
000000000040d565	outl	%eax, %dx
000000000040d566	.byte 0xff #bad opcode
000000000040d567	.byte 0xff #bad opcode
000000000040d568	.byte 0xdd #bad opcode
000000000040d569	.byte 0xf1 #bad opcode
000000000040d56a	.byte 0xff #bad opcode
000000000040d56b	decl	(%rdi)
000000000040d56d	.byte 0x1f #bad opcode
000000000040d56e	addb	%dl, 0x48(%rbp)
000000000040d572	movl	%esp, %ebp
000000000040d574	pushq	%r15
000000000040d576	pushq	%r14
000000000040d578	pushq	%r13
000000000040d57a	pushq	%r12
000000000040d57c	pushq	%rbx
000000000040d57d	subq	$0x88, %rsp
000000000040d584	movq	0x98(%rsi), %r13
000000000040d58b	movq	0x50(%rsi), %r15
000000000040d58f	movq	0x88(%rsi), %rax
000000000040d596	movq	%rax, -0x50(%rbp)
000000000040d59a	movups	0x78(%rsi), %xmm0
000000000040d59e	movaps	%xmm0, -0x60(%rbp)
000000000040d5a2	movq	0x70(%rsi), %rax
000000000040d5a6	movq	%rax, -0x30(%rbp)
000000000040d5aa	movups	0x60(%rsi), %xmm0
000000000040d5ae	movaps	%xmm0, -0x40(%rbp)
000000000040d5b2	cmpl	$0x0, 0x90(%rsi)
000000000040d5b9	je	0x40d637
000000000040d5bb	movq	%rsi, %rbx
000000000040d5be	movq	%rdi, %r14
000000000040d5c1	xorl	%r12d, %r12d
000000000040d5c4	nopw	%cs:(%rax,%rax)
000000000040d5d0	movsd	(%r15,%r12,8), %xmm1
000000000040d5d6	movq	(%r14), %rax
000000000040d5d9	xorps	%xmm0, %xmm0
000000000040d5dc	movq	%r14, %rdi
000000000040d5df	leaq	-0x40(%rbp), %rsi
000000000040d5e3	callq	*0x10(%rax)
000000000040d5e6	movsd	%xmm0, (%r13,%r12,8)
000000000040d5ed	movq	-0x50(%rbp), %rax
000000000040d5f1	movq	%rax, 0x28(%rsp)
000000000040d5f6	movaps	-0x60(%rbp), %xmm0
000000000040d5fa	movups	%xmm0, 0x18(%rsp)
000000000040d5ff	movq	-0x30(%rbp), %rax
000000000040d603	movq	%rax, 0x10(%rsp)
000000000040d608	movaps	-0x40(%rbp), %xmm0
000000000040d60c	movups	%xmm0, (%rsp)
000000000040d610	leaq	-0x78(%rbp), %rdi
000000000040d614	callq	0x6dcf06                        ## symbol stub for: _PC_CMTimeSaferAdd
000000000040d619	movq	-0x68(%rbp), %rax
000000000040d61d	movq	%rax, -0x30(%rbp)
000000000040d621	movups	-0x78(%rbp), %xmm0
000000000040d625	movaps	%xmm0, -0x40(%rbp)
000000000040d629	incq	%r12
000000000040d62c	movl	0x90(%rbx), %eax
000000000040d632	cmpq	%rax, %r12
000000000040d635	jb	0x40d5d0
000000000040d637	addq	$0x88, %rsp
000000000040d63e	popq	%rbx
000000000040d63f	popq	%r12
000000000040d641	popq	%r13
000000000040d643	popq	%r14
000000000040d645	popq	%r15
000000000040d647	popq	%rbp
000000000040d648	retq
000000000040d649	nopl	(%rax)
