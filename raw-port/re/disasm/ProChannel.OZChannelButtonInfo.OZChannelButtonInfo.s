__ZN19OZChannelButtonInfoC2Ev:
000000000005411e	pushq	%rbp
000000000005411f	movq	%rsp, %rbp
0000000000054122	pushq	%r14
0000000000054124	pushq	%rbx
0000000000054125	movq	%rdi, %rbx
0000000000054128	leaq	0x682c9(%rip), %rsi             ## literal pool for: ""
000000000005412f	movsd	0x5b3f1(%rip), %xmm1
0000000000054137	xorps	%xmm0, %xmm0
000000000005413a	movaps	%xmm1, %xmm2
000000000005413d	movaps	%xmm1, %xmm3
0000000000054140	movaps	%xmm1, %xmm4
0000000000054143	callq	__ZN13OZChannelInfoC2EdddddPKc  ## OZChannelInfo::OZChannelInfo(double, double, double, double, double, char const*)
0000000000054148	leaq	0x50(%rbx), %rdi
000000000005414c	movl	$0x64, %esi
0000000000054151	callq	0xacb46                         ## symbol stub for: __ZN11PCSingletonC2Ej
0000000000054156	leaq	__ZTV19OZChannelButtonInfo(%rip), %rax ## vtable for OZChannelButtonInfo
000000000005415d	leaq	0x10(%rax), %rcx
0000000000054161	movq	%rcx, (%rbx)
0000000000054164	addq	$0x30, %rax
0000000000054168	movq	%rax, 0x50(%rbx)
000000000005416c	popq	%rbx
000000000005416d	popq	%r14
000000000005416f	popq	%rbp
0000000000054170	retq
0000000000054171	movq	%rax, %r14
0000000000054174	movq	%rbx, %rdi
0000000000054177	callq	__ZN13OZChannelInfoD2Ev         ## OZChannelInfo::~OZChannelInfo()
000000000005417c	movq	%r14, %rdi
000000000005417f	callq	0xacaf2                         ## symbol stub for: __Unwind_Resume
