__ZN18OZFxPlugSharedLock5resetEv:
0000000000284740	pushq	%rbp
0000000000284741	movq	%rsp, %rbp
0000000000284744	pushq	%r14
0000000000284746	pushq	%rbx
0000000000284747	movq	%rdi, %rbx
000000000028474a	leaq	0x8(%rdi), %r14
000000000028474e	movq	%r14, %rdi
0000000000284751	callq	0x6ddb06                        ## symbol stub for: __ZN13PCSharedMutex4lockEv
0000000000284756	movq	$0x0, (%rbx)
000000000028475d	movq	%r14, %rdi
0000000000284760	callq	0x6ddb0c                        ## symbol stub for: __ZN13PCSharedMutex6unlockEv
0000000000284765	popq	%rbx
0000000000284766	popq	%r14
0000000000284768	popq	%rbp
0000000000284769	retq
000000000028476a	movq	%rax, %rdi
000000000028476d	callq	___clang_call_terminate
0000000000284772	nopw	%cs:(%rax,%rax)
