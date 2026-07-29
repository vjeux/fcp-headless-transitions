__ZNK9OZFactory15getSuperFactoryEv:
0000000000013648	pushq	%rbp
0000000000013649	movq	%rsp, %rbp
000000000001364c	pushq	%rbx
000000000001364d	subq	$0x18, %rsp
0000000000013651	movq	%rdi, %rbx
0000000000013654	movq	0x30(%rdi), %rax
0000000000013658	testq	%rax, %rax
000000000001365b	jne	0x136a0
000000000001365d	leaq	0x38(%rbx), %rdi
0000000000013661	movq	%rdi, -0x18(%rbp)
0000000000013665	callq	0xacca8                         ## symbol stub for: __ZN7PCMutex4lockEv
000000000001366a	movb	$0x1, -0x10(%rbp)
000000000001366e	movq	0x30(%rbx), %rax
0000000000013672	testq	%rax, %rax
0000000000013675	jne	0x1368c
0000000000013677	callq	__ZN11OZFactories11getInstanceEv ## OZFactories::getInstance()
000000000001367c	leaq	0x18(%rbx), %rsi
0000000000013680	movq	%rax, %rdi
0000000000013683	callq	__ZN11OZFactories11findFactoryERK6PCUUID ## OZFactories::findFactory(PCUUID const&)
0000000000013688	xchgq	%rax, 0x30(%rbx)
000000000001368c	movq	-0x18(%rbp), %rdi
0000000000013690	testq	%rdi, %rdi
0000000000013693	je	0x136a0
0000000000013695	cmpb	$0x0, -0x10(%rbp)
0000000000013699	je	0x136a0
000000000001369b	callq	0xaccae                         ## symbol stub for: __ZN7PCMutex6unlockEv
00000000000136a0	movq	0x30(%rbx), %rax
00000000000136a4	addq	$0x18, %rsp
00000000000136a8	popq	%rbx
00000000000136a9	popq	%rbp
00000000000136aa	retq
00000000000136ab	movq	%rax, %rdi
00000000000136ae	callq	___clang_call_terminate
00000000000136b3	movq	%rax, %rbx
00000000000136b6	leaq	-0x18(%rbp), %rdi
00000000000136ba	callq	__ZN12PCLockSentryI7PCMutexED1Ev ## PCLockSentry<PCMutex>::~PCLockSentry()
00000000000136bf	movq	%rbx, %rdi
00000000000136c2	callq	0xacaf2                         ## symbol stub for: __Unwind_Resume
00000000000136c7	nop
