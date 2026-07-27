0000000001248ccc	addb	%al, (%rax)
0000000001248cce	addb	%al, (%rax)
__ZN27WithRenderingAUSimpleScoperC1EP14AUSimpleScoperi:
0000000001248cd0	pushq	%rbp
0000000001248cd1	movq	%rsp, %rbp
0000000001248cd4	movq	%rsi, (%rdi)
0000000001248cd7	movb	$0x0, 0x8(%rdi)
0000000001248cdb	incl	%edx
0000000001248cdd	cmpl	$0x1, %edx
0000000001248ce0	ja	0x1248cf5
0000000001248ce2	movl	$0x1, %ecx
0000000001248ce7	xorl	%eax, %eax
0000000001248ce9	lock
0000000001248cea	cmpxchgl	%ecx, 0x2ac(%rsi)
0000000001248cf1	sete	0x8(%rdi)
0000000001248cf5	popq	%rbp
0000000001248cf6	retq
0000000001248cf7	nopw	(%rax,%rax)
__ZN27WithRenderingAUSimpleScoperD2Ev:
0000000001248d00	cmpb	$0x1, 0x8(%rdi)
0000000001248d04	jne	0x1248d1d
0000000001248d06	pushq	%rbp
0000000001248d07	movq	%rsp, %rbp
0000000001248d0a	movq	(%rdi), %rcx
0000000001248d0d	xorl	%edx, %edx
0000000001248d0f	movl	$0x1, %eax
0000000001248d14	lock
0000000001248d15	cmpxchgl	%edx, 0x2ac(%rcx)
0000000001248d1c	popq	%rbp
0000000001248d1d	retq
0000000001248d1e	nop
__ZN14AUSimpleScoperC2EP23ComponentInstanceRecord:
0000000001248d20	pushq	%rbp
0000000001248d21	movq	%rsp, %rbp
0000000001248d24	pushq	%rbx
