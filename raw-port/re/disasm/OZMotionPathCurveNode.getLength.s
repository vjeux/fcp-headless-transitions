__ZN21OZMotionPathCurveNode9getLengthERK6CMTime:
000000000040b230	pushq	%rbp
000000000040b231	movq	%rsp, %rbp
000000000040b234	pushq	%r15
000000000040b236	pushq	%r14
000000000040b238	pushq	%rbx
000000000040b239	subq	$0x128, %rsp                    ## imm = 0x128
000000000040b240	movq	%rsi, %rbx
000000000040b243	movq	%rdi, %r15
000000000040b246	movq	0x8(%rdi), %rdi
000000000040b24a	testq	%rdi, %rdi
000000000040b24d	je	0x40b269
000000000040b24f	leaq	__ZTI10OZBehavior(%rip), %rsi   ## typeinfo for OZBehavior
000000000040b256	leaq	__ZTI20OZMotionPathBehavior(%rip), %rdx ## typeinfo for OZMotionPathBehavior
000000000040b25d	xorl	%ecx, %ecx
000000000040b25f	callq	0x6dfd0e                        ## symbol stub for: ___dynamic_cast
000000000040b264	movq	%rax, %r14
000000000040b267	jmp	0x40b26c
000000000040b269	xorl	%r14d, %r14d
000000000040b26c	leaq	0x210(%r14), %rdi
000000000040b273	movq	0x419296(%rip), %rsi            ## literal pool symbol address: _kCMTimeZero
000000000040b27a	xorpd	%xmm0, %xmm0
000000000040b27e	callq	0x6dfa80                        ## symbol stub for: __ZNK9OZChannel13getValueAsIntERK6CMTimed
000000000040b283	cmpl	$0x1, %eax
000000000040b286	ja	0x40b2ac
000000000040b288	movq	%r14, %rdi
000000000040b28b	callq	__ZN20OZMotionPathBehavior18getPositionChannelEv ## OZMotionPathBehavior::getPositionChannel()
000000000040b290	movq	0x419279(%rip), %rsi            ## literal pool symbol address: _kCMTimeZero
000000000040b297	movq	%rax, %rdi
000000000040b29a	addq	$0x128, %rsp                    ## imm = 0x128
000000000040b2a1	popq	%rbx
000000000040b2a2	popq	%r14
000000000040b2a4	popq	%r15
000000000040b2a6	popq	%rbp
000000000040b2a7	jmp	0x6de556                        ## symbol stub for: __ZN19OZChannelPosition3D9getLengthERK6CMTime
000000000040b2ac	addl	$-0x2, %eax
000000000040b2af	cmpl	$0x3, %eax
000000000040b2b2	ja	0x40b3ee
000000000040b2b8	leaq	0x195(%rip), %rcx
000000000040b2bf	movslq	(%rcx,%rax,4), %rax
000000000040b2c3	addq	%rcx, %rax
000000000040b2c6	jmpq	*%rax
000000000040b2c8	leaq	0xb88(%r14), %rdi
000000000040b2cf	xorpd	%xmm0, %xmm0
000000000040b2d3	movq	%rbx, %rsi
000000000040b2d6	callq	0x6dfa9e                        ## symbol stub for: __ZNK9OZChannel16getValueAsDoubleERK6CMTimed
000000000040b2db	andpd	0x2fbb2d(%rip), %xmm0
000000000040b2e3	movapd	%xmm0, -0x30(%rbp)
000000000040b2e8	addq	$0xc20, %r14                    ## imm = 0xC20
000000000040b2ef	xorpd	%xmm0, %xmm0
000000000040b2f3	movq	%r14, %rdi
000000000040b2f6	movq	%rbx, %rsi
000000000040b2f9	callq	0x6dfa9e                        ## symbol stub for: __ZNK9OZChannel16getValueAsDoubleERK6CMTimed
000000000040b2fe	movapd	0x2fbb0a(%rip), %xmm1
000000000040b306	andpd	%xmm0, %xmm1
000000000040b30a	addq	$0x28, %r15
000000000040b30e	xorps	%xmm2, %xmm2
000000000040b311	xorps	%xmm3, %xmm3
000000000040b314	movq	%r15, %rdi
000000000040b317	movaps	-0x30(%rbp), %xmm0
000000000040b31b	addq	$0x128, %rsp                    ## imm = 0x128
000000000040b322	popq	%rbx
000000000040b323	popq	%r14
000000000040b325	popq	%r15
000000000040b327	popq	%rbp
000000000040b328	jmp	0x6dd608                        ## symbol stub for: __ZN11PCEvaluator19findLengthOfEllipseEdddd
000000000040b32d	leaq	0x11b8(%r14), %rdi
000000000040b334	xorpd	%xmm0, %xmm0
000000000040b338	movq	%rbx, %rsi
000000000040b33b	callq	0x6dfa9e                        ## symbol stub for: __ZNK9OZChannel16getValueAsDoubleERK6CMTimed
000000000040b340	movsd	%xmm0, -0x30(%rbp)
000000000040b345	addq	$0x1250, %r14                   ## imm = 0x1250
000000000040b34c	xorpd	%xmm0, %xmm0
000000000040b350	movq	%r14, %rdi
000000000040b353	movq	%rbx, %rsi
000000000040b356	callq	0x6dfa9e                        ## symbol stub for: __ZNK9OZChannel16getValueAsDoubleERK6CMTimed
000000000040b35b	movsd	-0x30(%rbp), %xmm1
000000000040b360	mulsd	%xmm1, %xmm1
000000000040b364	mulsd	%xmm0, %xmm0
000000000040b368	addsd	%xmm1, %xmm0
000000000040b36c	sqrtsd	%xmm0, %xmm0
000000000040b370	jmp	0x40b443
000000000040b375	addq	$0x1650, %r14                   ## imm = 0x1650
000000000040b37c	movq	%r14, %rdi
000000000040b37f	callq	__ZNK25OZChanObjectRefWithPicker7getNodeEv ## OZChanObjectRefWithPicker::getNode() const
000000000040b384	testq	%rax, %rax
000000000040b387	je	0x40b3ee
000000000040b389	leaq	__ZTI11OZSceneNode(%rip), %rsi  ## typeinfo for OZSceneNode
000000000040b390	leaq	__ZTI11OZRotoshape(%rip), %rdx  ## typeinfo for OZRotoshape
000000000040b397	movl	$0xc8, %ecx
000000000040b39c	movq	%rax, %rdi
000000000040b39f	callq	0x6dfd0e                        ## symbol stub for: ___dynamic_cast
000000000040b3a4	testq	%rax, %rax
000000000040b3a7	xorpd	%xmm0, %xmm0
000000000040b3ab	je	0x40b443
000000000040b3b1	movq	%rax, %r14
000000000040b3b4	leaq	-0x140(%rbp), %r15
000000000040b3bb	movq	%r15, %rdi
000000000040b3be	callq	__ZN13OZRenderStateC1Ev         ## OZRenderState::OZRenderState()
000000000040b3c3	movq	0x10(%rbx), %rax
000000000040b3c7	movq	%rax, -0x130(%rbp)
000000000040b3ce	movupd	(%rbx), %xmm0
000000000040b3d2	movapd	%xmm0, -0x140(%rbp)
000000000040b3da	movq	%r14, %rdi
000000000040b3dd	movq	%r15, %rsi
000000000040b3e0	movl	$0x1, %edx
000000000040b3e5	xorl	%ecx, %ecx
000000000040b3e7	callq	__ZN11OZRotoshape30getReparametrizedContourLengthERK13OZRenderStatebP14PCMatrix44TmplIdE ## OZRotoshape::getReparametrizedContourLength(OZRenderState const&, bool, PCMatrix44Tmpl<double>*)
000000000040b3ec	jmp	0x40b443
000000000040b3ee	xorpd	%xmm0, %xmm0
000000000040b3f2	jmp	0x40b443
000000000040b3f4	leaq	0xd40(%r14), %rdi
000000000040b3fb	xorpd	%xmm0, %xmm0
000000000040b3ff	movq	%rbx, %rsi
000000000040b402	callq	0x6dfa9e                        ## symbol stub for: __ZNK9OZChannel16getValueAsDoubleERK6CMTimed
000000000040b407	movapd	%xmm0, -0x30(%rbp)
000000000040b40c	addq	$0xdd8, %r14                    ## imm = 0xDD8
000000000040b413	xorpd	%xmm0, %xmm0
000000000040b417	movq	%r14, %rdi
000000000040b41a	movq	%rbx, %rsi
000000000040b41d	callq	0x6dfa9e                        ## symbol stub for: __ZNK9OZChannel16getValueAsDoubleERK6CMTimed
000000000040b422	movapd	-0x30(%rbp), %xmm1
000000000040b427	unpcklpd	%xmm0, %xmm1                    ## xmm1 = xmm1[0],xmm0[0]
000000000040b42b	andpd	0x2fb9dd(%rip), %xmm1
000000000040b433	addpd	%xmm1, %xmm1
000000000040b437	movapd	%xmm1, %xmm0
000000000040b43b	unpckhpd	%xmm1, %xmm0                    ## xmm0 = xmm0[1],xmm1[1]
000000000040b43f	addsd	%xmm1, %xmm0
000000000040b443	addq	$0x128, %rsp                    ## imm = 0x128
000000000040b44a	popq	%rbx
000000000040b44b	popq	%r14
000000000040b44d	popq	%r15
000000000040b44f	popq	%rbp
000000000040b450	retq
000000000040b451	nopl	(%rax)
000000000040b454	je	0x40b454
000000000040b456	.byte 0xff #bad opcode
000000000040b457	jmpq	*-0x26000001(%rax)
000000000040b45d	.byte 0xfe #bad opcode
000000000040b45e	.byte 0xff #bad opcode
000000000040b45f	jmpq	*(%rcx)
000000000040b461	.byte 0xff #bad opcode
000000000040b462	.byte 0xff #bad opcode
000000000040b463	jmpq	*0x66(%rsi)
000000000040b466	nopw	%cs:(%rax,%rax)
