__ZN36FFImageRepDeferredBlockImageAndState8setStateENS_23DeferredBlockImageStateE:
0000000000749190	pushq	%rbp
0000000000749191	movq	%rsp, %rbp
0000000000749194	pushq	%r14
0000000000749196	pushq	%rbx
0000000000749197	subq	$0x10, %rsp
000000000074919b	movl	%esi, %r14d
000000000074919e	movq	%rdi, %rbx
00000000007491a1	movq	%rdi, -0x20(%rbp)
00000000007491a5	movb	$0x0, -0x18(%rbp)
00000000007491a9	callq	__ZN16FFSynchronizable4LockEv   ## FFSynchronizable::Lock()
00000000007491ae	cmpl	0x90(%rbx), %r14d
00000000007491b5	je	0x7491c7
00000000007491b7	movl	%r14d, 0x90(%rbx)
00000000007491be	leaq	0x40(%rbx), %rdi
00000000007491c2	callq	0x1497a70                       ## symbol stub for: _pthread_cond_broadcast
00000000007491c7	movq	%rbx, %rdi
00000000007491ca	callq	__ZN16FFSynchronizable6UnlockEv ## FFSynchronizable::Unlock()
00000000007491cf	addq	$0x10, %rsp
00000000007491d3	popq	%rbx
00000000007491d4	popq	%r14
00000000007491d6	popq	%rbp
00000000007491d7	retq
00000000007491d8	movq	%rax, %rbx
00000000007491db	leaq	-0x20(%rbp), %rdi
00000000007491df	callq	__ZN14FFSynchronizerD1Ev        ## FFSynchronizer::~FFSynchronizer()
00000000007491e4	movq	%rbx, %rdi
00000000007491e7	callq	0x1495d30                       ## symbol stub for: __Unwind_Resume
00000000007491ec	movq	%rax, %rdi
00000000007491ef	callq	___clang_call_terminate
00000000007491f4	nopw	%cs:(%rax,%rax)
