__ZN29FFUnitAttachedParameterChaserC2EdP23ComponentInstanceRecordd:
0000000001236c30	pushq	%rbp
0000000001236c31	movq	%rsp, %rbp
0000000001236c34	pushq	%r14
0000000001236c36	pushq	%rbx
0000000001236c37	movq	%rsi, %r14
0000000001236c3a	movq	%rdi, %rbx
0000000001236c3d	callq	__ZN30FFSelfAdvancingParameterChaserC2Edd ## FFSelfAdvancingParameterChaser::FFSelfAdvancingParameterChaser(double, double)
0000000001236c42	leaq	0x6e6f1f(%rip), %rax
0000000001236c49	movq	%rax, (%rbx)
0000000001236c4c	movq	%r14, 0x128(%rbx)
0000000001236c53	leaq	__ZN29FFUnitAttachedParameterChaser19ObserveRenderHelperEPvPjPK14AudioTimeStampjjP15AudioBufferList(%rip), %rsi ## FFUnitAttachedParameterChaser::ObserveRenderHelper(void*, unsigned int*, AudioTimeStamp const*, unsigned int, unsigned int, AudioBufferList*)
0000000001236c5a	movq	%r14, %rdi
0000000001236c5d	movq	%rbx, %rdx
0000000001236c60	callq	0x1494608                       ## symbol stub for: _AudioUnitAddRenderNotify
0000000001236c65	popq	%rbx
0000000001236c66	popq	%r14
0000000001236c68	popq	%rbp
0000000001236c69	retq
0000000001236c6a	movq	%rax, %r14
0000000001236c6d	movq	%rbx, %rdi
0000000001236c70	callq	__ZN30FFSelfAdvancingParameterChaserD2Ev ## FFSelfAdvancingParameterChaser::~FFSelfAdvancingParameterChaser()
0000000001236c75	movq	%r14, %rdi
0000000001236c78	callq	0x1495d30                       ## symbol stub for: __Unwind_Resume
0000000001236c7d	nopl	(%rax)
