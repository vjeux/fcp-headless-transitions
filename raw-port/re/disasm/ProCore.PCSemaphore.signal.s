__ZN11PCSemaphore6signalEv:
0000000000034972	pushq	%rbp
0000000000034973	movq	%rsp, %rbp
0000000000034976	pushq	%r14
0000000000034978	pushq	%rbx
0000000000034979	movq	%rdi, %rbx
000000000003497c	leaq	0x38(%rdi), %r14
0000000000034980	movq	%r14, %rdi
0000000000034983	callq	0xdeabc                         ## symbol stub for: _pthread_mutex_lock
0000000000034988	incq	(%rbx)
000000000003498b	addq	$0x8, %rbx
000000000003498f	movq	%rbx, %rdi
0000000000034992	callq	0xdea86                         ## symbol stub for: _pthread_cond_signal
0000000000034997	movq	%r14, %rdi
000000000003499a	popq	%rbx
000000000003499b	popq	%r14
000000000003499d	popq	%rbp
000000000003499e	jmp	0xdeac2                         ## symbol stub for: _pthread_mutex_unlock
00000000000349a3	addb	%dl, 0x48(%rbp)
00000000000349a6	movl	%esp, %ebp
00000000000349a8	popq	%rbp
00000000000349a9	retq
