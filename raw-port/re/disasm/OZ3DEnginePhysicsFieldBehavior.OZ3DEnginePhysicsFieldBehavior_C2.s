00000000004f020f	addb	%dl, 0x48(%rbp)
00000000004f0212	movl	%esp, %ebp
00000000004f0214	pushq	%r15
00000000004f0216	pushq	%r14
00000000004f0218	pushq	%r13
00000000004f021a	pushq	%r12
00000000004f021c	pushq	%rbx
00000000004f021d	subq	$0x68, %rsp
00000000004f0221	movq	%rdi, %rbx
00000000004f0224	callq	__ZN10OZBehaviorC2EP9OZFactoryRK8PCStringj ## OZBehavior::OZBehavior(OZFactory*, PCString const&, unsigned int)
00000000004f0229	leaq	0x148(%rbx), %r13
00000000004f0230	movq	%r13, %rdi
00000000004f0233	callq	__ZN9OZLockingC2Ev              ## OZLocking::OZLocking()
00000000004f0238	leaq	0x387f41(%rip), %rax
00000000004f023f	movq	%rax, (%rbx)
00000000004f0242	leaq	0x3881cf(%rip), %rax
00000000004f0249	movq	%rax, 0x10(%rbx)
00000000004f024d	leaq	0x38841c(%rip), %rax
00000000004f0254	movq	%rax, 0x28(%rbx)
00000000004f0258	leaq	0x388469(%rip), %rax
00000000004f025f	movq	%rax, 0x148(%rbx)
00000000004f0266	leaq	0x2f00c5(%rip), %rsi            ## literal pool for: "Drag;Vortex;Radial Gravity;Linear Gravity;Noise;Turbulence;Electric;Magnetic"
00000000004f026d	leaq	-0x30(%rbp), %rdi
00000000004f0271	movq	%r13, -0x70(%rbp)
00000000004f0275	callq	0x6df09c                        ## symbol stub for: __ZN8PCStringC1EPKc
00000000004f027a	leaq	0x2f00fe(%rip), %rsi            ## literal pool for: "Type"
00000000004f0281	leaq	-0x38(%rbp), %rdi
00000000004f0285	callq	0x6df09c                        ## symbol stub for: __ZN8PCStringC1EPKc
00000000004f028a	leaq	0x210(%rbx), %r12
00000000004f0291	leaq	0x30(%rbx), %r15
00000000004f0295	xorps	%xmm0, %xmm0
00000000004f0298	movups	%xmm0, 0x8(%rsp)
00000000004f029d	movl	$0x0, (%rsp)
00000000004f02a4	leaq	-0x30(%rbp), %rdx
00000000004f02a8	leaq	-0x38(%rbp), %rcx
00000000004f02ac	movq	%r12, %rdi
00000000004f02af	movl	$0x1, %esi
00000000004f02b4	movq	%r15, %r8
00000000004f02b7	movl	$0xc8, %r9d
00000000004f02bd	callq	0x6dd9b0                        ## symbol stub for: __ZN13OZChannelEnumC1EjRK8PCStringS2_P15OZChannelFolderjjP13OZChannelImplP13OZChannelInfo
00000000004f02c2	leaq	-0x38(%rbp), %rdi
00000000004f02c6	callq	0x6df0c6                        ## symbol stub for: __ZN8PCStringD1Ev
00000000004f02cb	leaq	-0x30(%rbp), %rdi
00000000004f02cf	callq	0x6df0c6                        ## symbol stub for: __ZN8PCStringD1Ev
00000000004f02d4	leaq	0x2e107f(%rip), %rsi            ## literal pool for: "Strength"
00000000004f02db	leaq	-0x30(%rbp), %rdi
00000000004f02df	movq	%r12, -0x68(%rbp)
00000000004f02e3	callq	0x6df09c                        ## symbol stub for: __ZN8PCStringC1EPKc
00000000004f02e8	leaq	0x310(%rbx), %r14
00000000004f02ef	movq	$0x0, (%rsp)
00000000004f02f7	movsd	0x2150e1(%rip), %xmm0
00000000004f02ff	leaq	-0x30(%rbp), %rsi
00000000004f0303	movq	%r14, %rdi
00000000004f0306	movq	%r15, %rdx
00000000004f0309	movl	$0xcb, %ecx
00000000004f030e	xorl	%r8d, %r8d
00000000004f0311	xorl	%r9d, %r9d
00000000004f0314	callq	__ZN15OZChannelDoubleC2EdRK8PCStringP15OZChannelFolderjjP13OZChannelImplP13OZChannelInfo ## OZChannelDouble::OZChannelDouble(double, PCString const&, OZChannelFolder*, unsigned int, unsigned int, OZChannelImpl*, OZChannelInfo*)
00000000004f0319	leaq	-0x30(%rbp), %rdi
00000000004f031d	callq	0x6df0c6                        ## symbol stub for: __ZN8PCStringD1Ev
00000000004f0322	leaq	0x2f005b(%rip), %rsi            ## literal pool for: "Falloff Exponent"
00000000004f0329	leaq	-0x30(%rbp), %rdi
00000000004f032d	movq	%r14, -0x60(%rbp)
00000000004f0331	callq	0x6df09c                        ## symbol stub for: __ZN8PCStringC1EPKc
00000000004f0336	leaq	0x3a8(%rbx), %rdi
00000000004f033d	movq	$0x0, (%rsp)
00000000004f0345	movsd	0x215093(%rip), %xmm0
00000000004f034d	leaq	-0x30(%rbp), %rsi
00000000004f0351	movq	%rdi, -0x58(%rbp)
00000000004f0355	movq	%r15, %rdx
00000000004f0358	movl	$0xcc, %ecx
00000000004f035d	xorl	%r8d, %r8d
00000000004f0360	xorl	%r9d, %r9d
00000000004f0363	callq	__ZN15OZChannelDoubleC2EdRK8PCStringP15OZChannelFolderjjP13OZChannelImplP13OZChannelInfo ## OZChannelDouble::OZChannelDouble(double, PCString const&, OZChannelFolder*, unsigned int, unsigned int, OZChannelImpl*, OZChannelInfo*)
00000000004f0368	leaq	-0x30(%rbp), %rdi
00000000004f036c	callq	0x6df0c6                        ## symbol stub for: __ZN8PCStringD1Ev
00000000004f0371	leaq	0x2f001d(%rip), %rsi            ## literal pool for: "Infinite Extent"
00000000004f0378	leaq	-0x30(%rbp), %rdi
00000000004f037c	callq	0x6df09c                        ## symbol stub for: __ZN8PCStringC1EPKc
00000000004f0381	leaq	0x440(%rbx), %rdi
00000000004f0388	xorps	%xmm0, %xmm0
00000000004f038b	movups	%xmm0, (%rsp)
00000000004f038f	leaq	-0x30(%rbp), %rdx
00000000004f0393	movq	%rdi, -0x50(%rbp)
00000000004f0397	movl	$0x1, %esi
00000000004f039c	movq	%r15, %rcx
00000000004f039f	movl	$0xc9, %r8d
00000000004f03a5	xorl	%r9d, %r9d
00000000004f03a8	callq	0x6dd950                        ## symbol stub for: __ZN13OZChannelBoolC1EiRK8PCStringP15OZChannelFolderjjP13OZChannelImplP13OZChannelInfo
00000000004f03ad	leaq	-0x30(%rbp), %rdi
00000000004f03b1	callq	0x6df0c6                        ## symbol stub for: __ZN8PCStringD1Ev
00000000004f03b6	leaq	0x2effe8(%rip), %rsi            ## literal pool for: "Extent"
00000000004f03bd	leaq	-0x30(%rbp), %rdi
00000000004f03c1	callq	0x6df09c                        ## symbol stub for: __ZN8PCStringC1EPKc
00000000004f03c6	leaq	0x4d8(%rbx), %rdi
00000000004f03cd	xorps	%xmm0, %xmm0
00000000004f03d0	movups	%xmm0, (%rsp)
00000000004f03d4	movsd	0x215004(%rip), %xmm0
00000000004f03dc	leaq	-0x30(%rbp), %rsi
00000000004f03e0	movq	%rdi, -0x48(%rbp)
00000000004f03e4	movaps	%xmm0, %xmm1
00000000004f03e7	movaps	%xmm0, %xmm2
00000000004f03ea	movq	%r15, %rdx
00000000004f03ed	movl	$0xca, %ecx
00000000004f03f2	xorl	%r8d, %r8d
00000000004f03f5	movl	$0x3, %r9d
00000000004f03fb	callq	0x6dd590                        ## symbol stub for: __ZN11OZChannel3DC1EdddRK8PCStringP15OZChannelFolderjjjP13OZChannelImplP13OZChannelInfo
00000000004f0400	leaq	-0x30(%rbp), %rdi
00000000004f0404	callq	0x6df0c6                        ## symbol stub for: __ZN8PCStringD1Ev
00000000004f0409	leaq	0x2e0f32(%rip), %rsi            ## literal pool for: "Direction"
00000000004f0410	leaq	-0x30(%rbp), %rdi
00000000004f0414	callq	0x6df09c                        ## symbol stub for: __ZN8PCStringC1EPKc
00000000004f0419	leaq	0x728(%rbx), %rdi
00000000004f0420	xorps	%xmm0, %xmm0
00000000004f0423	movups	%xmm0, (%rsp)
00000000004f0427	movsd	0x2172f9(%rip), %xmm1
00000000004f042f	leaq	-0x30(%rbp), %rsi
00000000004f0433	xorps	%xmm0, %xmm0
00000000004f0436	xorps	%xmm2, %xmm2
00000000004f0439	movq	%rdi, -0x40(%rbp)
00000000004f043d	movq	%r15, %rdx
00000000004f0440	movl	$0xcd, %ecx
00000000004f0445	xorl	%r8d, %r8d
00000000004f0448	movl	$0x3, %r9d
00000000004f044e	callq	0x6dd590                        ## symbol stub for: __ZN11OZChannel3DC1EdddRK8PCStringP15OZChannelFolderjjjP13OZChannelImplP13OZChannelInfo
00000000004f0453	leaq	-0x30(%rbp), %rdi
00000000004f0457	callq	0x6df0c6                        ## symbol stub for: __ZN8PCStringD1Ev
00000000004f045c	leaq	0x2eff49(%rip), %rsi            ## literal pool for: "Smoothness"
00000000004f0463	leaq	-0x30(%rbp), %rdi
00000000004f0467	callq	0x6df09c                        ## symbol stub for: __ZN8PCStringC1EPKc
00000000004f046c	leaq	0x978(%rbx), %r14
00000000004f0473	movq	$0x0, (%rsp)
00000000004f047b	leaq	-0x30(%rbp), %rsi
00000000004f047f	xorps	%xmm0, %xmm0
00000000004f0482	movq	%r14, %rdi
00000000004f0485	movq	%r15, %rdx
00000000004f0488	movl	$0xce, %ecx
00000000004f048d	xorl	%r8d, %r8d
00000000004f0490	xorl	%r9d, %r9d
00000000004f0493	callq	__ZN15OZChannelDoubleC2EdRK8PCStringP15OZChannelFolderjjP13OZChannelImplP13OZChannelInfo ## OZChannelDouble::OZChannelDouble(double, PCString const&, OZChannelFolder*, unsigned int, unsigned int, OZChannelImpl*, OZChannelInfo*)
00000000004f0498	leaq	-0x30(%rbp), %rdi
00000000004f049c	callq	0x6df0c6                        ## symbol stub for: __ZN8PCStringD1Ev
00000000004f04a1	leaq	0x2eff0f(%rip), %rsi            ## literal pool for: "Animation Speed"
00000000004f04a8	leaq	-0x30(%rbp), %rdi
00000000004f04ac	callq	0x6df09c                        ## symbol stub for: __ZN8PCStringC1EPKc
00000000004f04b1	leaq	0xa10(%rbx), %r12
00000000004f04b8	movq	$0x0, (%rsp)
00000000004f04c0	movsd	0x214f18(%rip), %xmm0
00000000004f04c8	leaq	-0x30(%rbp), %rsi
00000000004f04cc	movq	%r12, %rdi
00000000004f04cf	movq	%r15, %rdx
00000000004f04d2	movl	$0xcf, %ecx
00000000004f04d7	xorl	%r8d, %r8d
00000000004f04da	xorl	%r9d, %r9d
00000000004f04dd	callq	__ZN15OZChannelDoubleC2EdRK8PCStringP15OZChannelFolderjjP13OZChannelImplP13OZChannelInfo ## OZChannelDouble::OZChannelDouble(double, PCString const&, OZChannelFolder*, unsigned int, unsigned int, OZChannelImpl*, OZChannelInfo*)
00000000004f04e2	leaq	-0x30(%rbp), %rdi
00000000004f04e6	callq	0x6df0c6                        ## symbol stub for: __ZN8PCStringD1Ev
00000000004f04eb	leaq	0x2efed5(%rip), %rsi            ## literal pool for: "Minimum Falloff Distance"
00000000004f04f2	leaq	-0x30(%rbp), %rdi
00000000004f04f6	callq	0x6df09c                        ## symbol stub for: __ZN8PCStringC1EPKc
00000000004f04fb	leaq	0xaa8(%rbx), %r13
00000000004f0502	movq	$0x0, (%rsp)
00000000004f050a	movsd	0x219b9e(%rip), %xmm0
00000000004f0512	leaq	-0x30(%rbp), %rsi
00000000004f0516	movq	%r13, %rdi
00000000004f0519	movq	%r15, %rdx
00000000004f051c	movl	$0xd0, %ecx
00000000004f0521	xorl	%r8d, %r8d
00000000004f0524	xorl	%r9d, %r9d
00000000004f0527	callq	__ZN15OZChannelDoubleC2EdRK8PCStringP15OZChannelFolderjjP13OZChannelImplP13OZChannelInfo ## OZChannelDouble::OZChannelDouble(double, PCString const&, OZChannelFolder*, unsigned int, unsigned int, OZChannelImpl*, OZChannelInfo*)
00000000004f052c	leaq	-0x30(%rbp), %rdi
00000000004f0530	callq	0x6df0c6                        ## symbol stub for: __ZN8PCStringD1Ev
00000000004f0535	xorps	%xmm0, %xmm0
00000000004f0538	movq	%r14, %rdi
00000000004f053b	callq	0x6df438                        ## symbol stub for: __ZN9OZChannel6setMinEd
00000000004f0540	movsd	0x214e98(%rip), %xmm0
00000000004f0548	movq	%r14, %rdi
00000000004f054b	callq	0x6df432                        ## symbol stub for: __ZN9OZChannel6setMaxEd
00000000004f0550	movsd	0x219b58(%rip), %xmm0
00000000004f0558	movq	%r13, %rdi
00000000004f055b	callq	0x6df438                        ## symbol stub for: __ZN9OZChannel6setMinEd
00000000004f0560	addq	$0x68, %rsp
00000000004f0564	popq	%rbx
00000000004f0565	popq	%r12
00000000004f0567	popq	%r13
00000000004f0569	popq	%r14
00000000004f056b	popq	%r15
00000000004f056d	popq	%rbp
00000000004f056e	retq
00000000004f056f	movq	%rax, %r15
00000000004f0572	leaq	-0x30(%rbp), %rdi
00000000004f0576	callq	0x6df0c6                        ## symbol stub for: __ZN8PCStringD1Ev
00000000004f057b	jmp	0x4f0673
00000000004f0580	movq	%rax, %r15
00000000004f0583	jmp	0x4f0673
00000000004f0588	movq	%rax, %r15
00000000004f058b	leaq	-0x30(%rbp), %rdi
00000000004f058f	callq	0x6df0c6                        ## symbol stub for: __ZN8PCStringD1Ev
00000000004f0594	jmp	0x4f067b
00000000004f0599	movq	%rax, %r15
00000000004f059c	jmp	0x4f067b
00000000004f05a1	movq	%rax, %r15
00000000004f05a4	leaq	-0x30(%rbp), %rdi
00000000004f05a8	callq	0x6df0c6                        ## symbol stub for: __ZN8PCStringD1Ev
00000000004f05ad	jmp	0x4f0683
00000000004f05b2	movq	%rax, %r15
00000000004f05b5	jmp	0x4f0683
00000000004f05ba	movq	%rax, %r15
00000000004f05bd	leaq	-0x30(%rbp), %rdi
00000000004f05c1	callq	0x6df0c6                        ## symbol stub for: __ZN8PCStringD1Ev
00000000004f05c6	jmp	0x4f068c
00000000004f05cb	movq	%rax, %r15
00000000004f05ce	jmp	0x4f068c
00000000004f05d3	movq	%rax, %r15
00000000004f05d6	leaq	-0x30(%rbp), %rdi
00000000004f05da	callq	0x6df0c6                        ## symbol stub for: __ZN8PCStringD1Ev
00000000004f05df	jmp	0x4f0695
00000000004f05e4	movq	%rax, %r15
00000000004f05e7	jmp	0x4f0695
00000000004f05ec	movq	%rax, %r15
00000000004f05ef	leaq	-0x30(%rbp), %rdi
00000000004f05f3	callq	0x6df0c6                        ## symbol stub for: __ZN8PCStringD1Ev
00000000004f05f8	jmp	0x4f069e
00000000004f05fd	movq	%rax, %r15
00000000004f0600	jmp	0x4f069e
00000000004f0605	movq	%rax, %r15
00000000004f0608	leaq	-0x30(%rbp), %rdi
00000000004f060c	callq	0x6df0c6                        ## symbol stub for: __ZN8PCStringD1Ev
00000000004f0611	jmp	0x4f06a7
00000000004f0616	movq	%rax, %r15
00000000004f0619	jmp	0x4f06a7
00000000004f061e	movq	%rax, %r15
00000000004f0621	leaq	-0x30(%rbp), %rdi
00000000004f0625	callq	0x6df0c6                        ## symbol stub for: __ZN8PCStringD1Ev
00000000004f062a	jmp	0x4f06b0
00000000004f062f	movq	%rax, %r15
00000000004f0632	jmp	0x4f06b0
00000000004f0634	movq	%rax, %r15
00000000004f0637	leaq	-0x38(%rbp), %rdi
00000000004f063b	callq	0x6df0c6                        ## symbol stub for: __ZN8PCStringD1Ev
00000000004f0640	jmp	0x4f0645
00000000004f0642	movq	%rax, %r15
00000000004f0645	leaq	-0x30(%rbp), %rdi
00000000004f0649	callq	0x6df0c6                        ## symbol stub for: __ZN8PCStringD1Ev
00000000004f064e	jmp	0x4f06b9
00000000004f0650	movq	%rax, %r15
00000000004f0653	jmp	0x4f06b9
00000000004f0655	movq	%rax, %r15
00000000004f0658	movq	%rbx, %rdi
00000000004f065b	callq	__ZN10OZBehaviorD2Ev            ## OZBehavior::~OZBehavior()
00000000004f0660	movq	%r15, %rdi
00000000004f0663	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
00000000004f0668	movq	%rax, %r15
00000000004f066b	movq	%r13, %rdi
00000000004f066e	callq	0x6df480                        ## symbol stub for: __ZN9OZChannelD2Ev
00000000004f0673	movq	%r12, %rdi
00000000004f0676	callq	0x6df480                        ## symbol stub for: __ZN9OZChannelD2Ev
00000000004f067b	movq	%r14, %rdi
00000000004f067e	callq	0x6df480                        ## symbol stub for: __ZN9OZChannelD2Ev
00000000004f0683	movq	-0x40(%rbp), %rdi
00000000004f0687	callq	__ZN11OZChannel3DD1Ev           ## OZChannel3D::~OZChannel3D()
00000000004f068c	movq	-0x48(%rbp), %rdi
00000000004f0690	callq	__ZN11OZChannel3DD1Ev           ## OZChannel3D::~OZChannel3D()
00000000004f0695	movq	-0x50(%rbp), %rdi
00000000004f0699	callq	0x6dd956                        ## symbol stub for: __ZN13OZChannelBoolD1Ev
00000000004f069e	movq	-0x58(%rbp), %rdi
00000000004f06a2	callq	0x6df480                        ## symbol stub for: __ZN9OZChannelD2Ev
00000000004f06a7	movq	-0x60(%rbp), %rdi
00000000004f06ab	callq	0x6df480                        ## symbol stub for: __ZN9OZChannelD2Ev
00000000004f06b0	movq	-0x68(%rbp), %rdi
00000000004f06b4	callq	0x6dd9d4                        ## symbol stub for: __ZN13OZChannelEnumD1Ev
00000000004f06b9	movq	-0x70(%rbp), %rdi
00000000004f06bd	callq	__ZN9OZLockingD2Ev              ## OZLocking::~OZLocking()
00000000004f06c2	movq	%rbx, %rdi
00000000004f06c5	callq	__ZN10OZBehaviorD2Ev            ## OZBehavior::~OZBehavior()
00000000004f06ca	movq	%r15, %rdi
00000000004f06cd	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
00000000004f06d2	nopw	%cs:(%rax,%rax)
