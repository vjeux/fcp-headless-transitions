__ZNK12OZTimeMarkerneERKS_:
0000000000210a40	pushq	%rbp
0000000000210a41	movq	%rsp, %rbp
0000000000210a44	pushq	%r15
0000000000210a46	pushq	%r14
0000000000210a48	pushq	%rbx
0000000000210a49	subq	$0x48, %rsp
0000000000210a4d	movq	%rsi, %rbx
0000000000210a50	movq	%rdi, %r14
0000000000210a53	movq	0x18(%rdi), %rax
0000000000210a57	movq	%rax, -0x20(%rbp)
0000000000210a5b	movups	0x8(%rdi), %xmm0
0000000000210a5f	movaps	%xmm0, -0x30(%rbp)
0000000000210a63	movq	0x18(%rsi), %rax
0000000000210a67	movq	%rax, 0x28(%rsp)
0000000000210a6c	movups	0x8(%rsi), %xmm0
0000000000210a70	movups	%xmm0, 0x18(%rsp)
0000000000210a75	movq	-0x20(%rbp), %rax
0000000000210a79	movq	%rax, 0x10(%rsp)
0000000000210a7e	movaps	-0x30(%rbp), %xmm0
0000000000210a82	movups	%xmm0, (%rsp)
0000000000210a86	callq	0x6dcab0                        ## symbol stub for: _CMTimeCompare
0000000000210a8b	movb	$0x1, %r15b
0000000000210a8e	testl	%eax, %eax
0000000000210a90	jne	0x210b05
0000000000210a92	movq	0x30(%r14), %rax
0000000000210a96	movq	%rax, -0x20(%rbp)
0000000000210a9a	movups	0x20(%r14), %xmm0
0000000000210a9f	movaps	%xmm0, -0x30(%rbp)
0000000000210aa3	movq	0x30(%rbx), %rax
0000000000210aa7	movq	%rax, 0x28(%rsp)
0000000000210aac	movups	0x20(%rbx), %xmm0
0000000000210ab0	movups	%xmm0, 0x18(%rsp)
0000000000210ab5	movq	-0x20(%rbp), %rax
0000000000210ab9	movq	%rax, 0x10(%rsp)
0000000000210abe	movaps	-0x30(%rbp), %xmm0
0000000000210ac2	movups	%xmm0, (%rsp)
0000000000210ac6	callq	0x6dcab0                        ## symbol stub for: _CMTimeCompare
0000000000210acb	testl	%eax, %eax
0000000000210acd	jne	0x210b05
0000000000210acf	leaq	0x38(%r14), %rdi
0000000000210ad3	leaq	0x38(%rbx), %rsi
0000000000210ad7	callq	0x6dfa50                        ## symbol stub for: __ZNK8PCString7compareERKS_
0000000000210adc	testl	%eax, %eax
0000000000210ade	jne	0x210b05
0000000000210ae0	leaq	0x40(%r14), %rdi
0000000000210ae4	leaq	0x40(%rbx), %rsi
0000000000210ae8	callq	0x6dfa50                        ## symbol stub for: __ZNK8PCString7compareERKS_
0000000000210aed	testl	%eax, %eax
0000000000210aef	jne	0x210b05
0000000000210af1	movl	0x48(%r14), %eax
0000000000210af5	cmpl	0x48(%rbx), %eax
0000000000210af8	jne	0x210b05
0000000000210afa	movl	0x4c(%r14), %eax
0000000000210afe	cmpl	0x4c(%rbx), %eax
0000000000210b01	setne	%r15b
0000000000210b05	movl	%r15d, %eax
0000000000210b08	addq	$0x48, %rsp
0000000000210b0c	popq	%rbx
0000000000210b0d	popq	%r14
0000000000210b0f	popq	%r15
0000000000210b11	popq	%rbp
0000000000210b12	retq
0000000000210b13	nopw	%cs:(%rax,%rax)
