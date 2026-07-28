__ZN18OZFxPlugSharedLockD1Ev:
00000000002846e0	pushq	%rbp
00000000002846e1	movq	%rsp, %rbp
00000000002846e4	pushq	%r14
00000000002846e6	pushq	%rbx
00000000002846e7	movq	%rdi, %r14
00000000002846ea	leaq	0x8(%rdi), %rbx
00000000002846ee	movq	%rbx, %rdi
00000000002846f1	callq	0x6ddb06                        ## symbol stub for: __ZN13PCSharedMutex4lockEv
00000000002846f6	movq	$0x0, (%r14)
00000000002846fd	movq	%rbx, %rdi
0000000000284700	callq	0x6ddb0c                        ## symbol stub for: __ZN13PCSharedMutex6unlockEv
0000000000284705	movq	0x58(%r14), %rdi
0000000000284709	testq	%rdi, %rdi
000000000028470c	je	0x284717
000000000028470e	movq	%rdi, 0x60(%r14)
0000000000284712	callq	0x6dfc36                        ## symbol stub for: __ZdlPv
0000000000284717	movq	%rbx, %rdi
000000000028471a	popq	%rbx
000000000028471b	popq	%r14
000000000028471d	popq	%rbp
000000000028471e	jmp	0x6dfbe2                        ## symbol stub for: __ZNSt3__15mutexD1Ev
0000000000284723	movq	%rax, %rdi
0000000000284726	callq	___clang_call_terminate
000000000028472b	movq	%rax, %rdi
000000000028472e	callq	___clang_call_terminate
0000000000284733	nopw	%cs:(%rax,%rax)
