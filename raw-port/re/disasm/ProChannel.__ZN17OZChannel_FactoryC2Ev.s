__ZN17OZChannel_FactoryC2Ev:
0000000000003196	pushq	%rbp
0000000000003197	movq	%rsp, %rbp
000000000000319a	pushq	%r14
000000000000319c	pushq	%rbx
000000000000319d	subq	$0x20, %rsp
00000000000031a1	movq	%rdi, %rbx
00000000000031a4	movaps	0xac405(%rip), %xmm0
00000000000031ab	leaq	-0x30(%rbp), %rsi
00000000000031af	movaps	%xmm0, (%rsi)
00000000000031b2	movaps	0xac3e7(%rip), %xmm0
00000000000031b9	leaq	-0x20(%rbp), %rdx
00000000000031bd	movaps	%xmm0, (%rdx)
00000000000031c0	movl	$0x1, %ecx
00000000000031c5	callq	__ZN9OZFactoryC2E6PCUUIDS0_j    ## OZFactory::OZFactory(PCUUID, PCUUID, unsigned int)
00000000000031ca	leaq	__ZTV16OZChannelFactory(%rip), %rax ## vtable for OZChannelFactory
00000000000031d1	addq	$0x10, %rax
00000000000031d5	movq	%rax, (%rbx)
00000000000031d8	leaq	0x80(%rbx), %rdi
00000000000031df	xorl	%esi, %esi
00000000000031e1	callq	0xacb46                         ## symbol stub for: __ZN11PCSingletonC2Ej
00000000000031e6	leaq	0xc7943(%rip), %rax
00000000000031ed	movq	%rax, (%rbx)
00000000000031f0	leaq	0xc7a09(%rip), %rax
00000000000031f7	movq	%rax, 0x80(%rbx)
00000000000031fe	addq	$0x20, %rsp
0000000000003202	popq	%rbx
0000000000003203	popq	%r14
0000000000003205	popq	%rbp
0000000000003206	retq
0000000000003207	movq	%rax, %r14
000000000000320a	movq	%rbx, %rdi
000000000000320d	callq	__ZN9OZFactoryD2Ev              ## OZFactory::~OZFactory()
0000000000003212	movq	%r14, %rdi
0000000000003215	callq	0xacaf2                         ## symbol stub for: __Unwind_Resume
