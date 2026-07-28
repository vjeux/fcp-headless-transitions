__ZN11PCSemaphore4waitEv:
0000000000034922	pushq	%rbp
0000000000034923	movq	%rsp, %rbp
0000000000034926	pushq	%r15
0000000000034928	pushq	%r14
000000000003492a	pushq	%rbx
000000000003492b	pushq	%rax
000000000003492c	movq	%rdi, %r14
000000000003492f	leaq	0x38(%rdi), %rbx
0000000000034933	movq	%rbx, %rdi
0000000000034936	callq	0xdeabc                         ## symbol stub for: _pthread_mutex_lock
000000000003493b	movq	(%r14), %rax
000000000003493e	testq	%rax, %rax
0000000000034941	jne	0x3495a
0000000000034943	leaq	0x8(%r14), %r15
0000000000034947	movq	%r15, %rdi
000000000003494a	movq	%rbx, %rsi
000000000003494d	callq	0xdea92                         ## symbol stub for: _pthread_cond_wait
0000000000034952	movq	(%r14), %rax
0000000000034955	testq	%rax, %rax
0000000000034958	je	0x34947
000000000003495a	decq	%rax
000000000003495d	movq	%rax, (%r14)
0000000000034960	movq	%rbx, %rdi
0000000000034963	addq	$0x8, %rsp
0000000000034967	popq	%rbx
0000000000034968	popq	%r14
000000000003496a	popq	%r15
000000000003496c	popq	%rbp
000000000003496d	jmp	0xdeac2                         ## symbol stub for: _pthread_mutex_unlock
