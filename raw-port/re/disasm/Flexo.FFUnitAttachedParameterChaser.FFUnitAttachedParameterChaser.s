__ZN29FFUnitAttachedParameterChaserC1EdP23ComponentInstanceRecordd:
0000000001236cf0	pushq	%rbp
0000000001236cf1	movq	%rsp, %rbp
0000000001236cf4	pushq	%r14
0000000001236cf6	pushq	%rbx
0000000001236cf7	movq	%rsi, %r14
0000000001236cfa	movq	%rdi, %rbx
0000000001236cfd	callq	__ZN30FFSelfAdvancingParameterChaserC2Edd ## FFSelfAdvancingParameterChaser::FFSelfAdvancingParameterChaser(double, double)
0000000001236d02	leaq	0x6e6e5f(%rip), %rax
0000000001236d09	movq	%rax, (%rbx)
0000000001236d0c	movq	%r14, 0x128(%rbx)
0000000001236d13	leaq	__ZN29FFUnitAttachedParameterChaser19ObserveRenderHelperEPvPjPK14AudioTimeStampjjP15AudioBufferList(%rip), %rsi ## FFUnitAttachedParameterChaser::ObserveRenderHelper(void*, unsigned int*, AudioTimeStamp const*, unsigned int, unsigned int, AudioBufferList*)
0000000001236d1a	movq	%r14, %rdi
0000000001236d1d	movq	%rbx, %rdx
0000000001236d20	callq	0x1494608                       ## symbol stub for: _AudioUnitAddRenderNotify
0000000001236d25	popq	%rbx
0000000001236d26	popq	%r14
0000000001236d28	popq	%rbp
0000000001236d29	retq
0000000001236d2a	movq	%rax, %r14
0000000001236d2d	movq	%rbx, %rdi
0000000001236d30	callq	__ZN30FFSelfAdvancingParameterChaserD2Ev ## FFSelfAdvancingParameterChaser::~FFSelfAdvancingParameterChaser()
0000000001236d35	movq	%r14, %rdi
0000000001236d38	callq	0x1495d30                       ## symbol stub for: __Unwind_Resume
0000000001236d3d	nopl	(%rax)
