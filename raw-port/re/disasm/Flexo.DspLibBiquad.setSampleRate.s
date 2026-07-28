__ZN12DspLibBiquad13setSampleRateEj:
0000000001228e90	movl	%esi, 0x18(%rdi)
0000000001228e93	cmpl	$0x0, 0x1c(%rdi)
0000000001228e97	je	0x1228ec8
0000000001228e99	pushq	%rbp
0000000001228e9a	movq	%rsp, %rbp
0000000001228e9d	pushq	%r14
0000000001228e9f	pushq	%rbx
0000000001228ea0	movq	%rdi, %rbx
0000000001228ea3	xorl	%r14d, %r14d
0000000001228ea6	nopw	%cs:(%rax,%rax)
0000000001228eb0	movq	%rbx, %rdi
0000000001228eb3	movl	%r14d, %esi
0000000001228eb6	callq	__ZN12DspLibBiquad21calculateCoefficientsEj ## DspLibBiquad::calculateCoefficients(unsigned int)
0000000001228ebb	incl	%r14d
0000000001228ebe	cmpl	0x1c(%rbx), %r14d
0000000001228ec2	jb	0x1228eb0
0000000001228ec4	popq	%rbx
0000000001228ec5	popq	%r14
0000000001228ec7	popq	%rbp
0000000001228ec8	retq
0000000001228ec9	nopl	(%rax)
