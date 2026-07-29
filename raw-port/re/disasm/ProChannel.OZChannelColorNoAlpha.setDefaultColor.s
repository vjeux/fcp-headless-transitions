__ZN21OZChannelColorNoAlpha15setDefaultColorERK7PCColor:
000000000005679a	pushq	%rbp
000000000005679b	movq	%rsp, %rbp
000000000005679e	pushq	%r14
00000000000567a0	pushq	%rbx
00000000000567a1	subq	$0x20, %rsp
00000000000567a5	movq	%rsi, %r14
00000000000567a8	movq	%rdi, %rbx
00000000000567ab	cmpb	$0x1, 0x3e8(%rdi)
00000000000567b2	jne	0x567c2
00000000000567b4	leaq	-0x18(%rbp), %rdi
00000000000567b8	movq	%rbx, %rsi
00000000000567bb	callq	__ZNK21OZChannelColorNoAlpha15getPCColorSpaceEv ## OZChannelColorNoAlpha::getPCColorSpace() const
00000000000567c0	jmp	0x567ce
00000000000567c2	leaq	-0x18(%rbp), %rdi
00000000000567c6	movq	%r14, %rsi
00000000000567c9	callq	0xacd5c                         ## symbol stub for: __ZNK7PCColor13getColorSpaceEv
00000000000567ce	leaq	-0x24(%rbp), %rsi
00000000000567d2	leaq	-0x20(%rbp), %rdx
00000000000567d6	leaq	-0x1c(%rbp), %rcx
00000000000567da	leaq	-0x18(%rbp), %r8
00000000000567de	movq	%r14, %rdi
00000000000567e1	callq	0xacd68                         ## symbol stub for: __ZNK7PCColor6getRGBEPfS0_S0_RK18PCColorSpaceHandle
00000000000567e6	leaq	-0x18(%rbp), %rdi
00000000000567ea	callq	__ZN7PCCFRefIP12CGColorSpaceED2Ev ## PCCFRef<CGColorSpace*>::~PCCFRef()
00000000000567ef	leaq	0x88(%rbx), %rdi
00000000000567f6	cvtss2sd	-0x24(%rbp), %xmm0
00000000000567fb	callq	__ZN9OZChannel15setDefaultValueEd ## OZChannel::setDefaultValue(double)
0000000000056800	leaq	0x120(%rbx), %rdi
0000000000056807	xorps	%xmm0, %xmm0
000000000005680a	cvtss2sd	-0x20(%rbp), %xmm0
000000000005680f	callq	__ZN9OZChannel15setDefaultValueEd ## OZChannel::setDefaultValue(double)
0000000000056814	leaq	0x1b8(%rbx), %rdi
000000000005681b	xorps	%xmm0, %xmm0
000000000005681e	cvtss2sd	-0x1c(%rbp), %xmm0
0000000000056823	callq	__ZN9OZChannel15setDefaultValueEd ## OZChannel::setDefaultValue(double)
0000000000056828	movabsq	$0x200000000, %rsi              ## imm = 0x200000000
0000000000056832	movq	%rbx, %rdi
0000000000056835	callq	__ZNK13OZChannelBase8testFlagEy ## OZChannelBase::testFlag(unsigned long long) const
000000000005683a	testb	%al, %al
000000000005683c	je	0x56855
000000000005683e	movabsq	$0x100000000, %rsi              ## imm = 0x100000000
0000000000056848	movq	%rbx, %rdi
000000000005684b	movl	$0x1, %edx
0000000000056850	callq	__ZN13OZChannelBase7setFlagEyb  ## OZChannelBase::setFlag(unsigned long long, bool)
0000000000056855	addq	$0x20, %rsp
0000000000056859	popq	%rbx
000000000005685a	popq	%r14
000000000005685c	popq	%rbp
000000000005685d	retq
000000000005685e	movq	%rax, %rbx
0000000000056861	leaq	-0x18(%rbp), %rdi
0000000000056865	callq	__ZN7PCCFRefIP12CGColorSpaceED2Ev ## PCCFRef<CGColorSpace*>::~PCCFRef()
000000000005686a	movq	%rbx, %rdi
000000000005686d	callq	0xacaf2                         ## symbol stub for: __Unwind_Resume
