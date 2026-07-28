__ZN14HGSynchronizerD1Ev:
0000000000021b50	pushq	%rbp
0000000000021b51	movq	%rsp, %rbp
0000000000021b54	cmpb	$0x0, 0x8(%rdi)
0000000000021b58	jne	0x21b62
0000000000021b5a	movq	(%rdi), %rdi
0000000000021b5d	callq	__ZN16HGSynchronizable6UnlockEv ## HGSynchronizable::Unlock()
0000000000021b62	popq	%rbp
0000000000021b63	retq
0000000000021b64	movq	%rax, %rdi
0000000000021b67	callq	___clang_call_terminate
0000000000021b6c	nopl	(%rax)
