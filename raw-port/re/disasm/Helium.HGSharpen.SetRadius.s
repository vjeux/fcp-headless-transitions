__ZN9HGSharpen9SetRadiusEf:
000000000003ffc0	pushq	%rbp
000000000003ffc1	movq	%rsp, %rbp
000000000003ffc4	pushq	%rbx
000000000003ffc5	pushq	%rax
000000000003ffc6	movss	%xmm0, -0xc(%rbp)
000000000003ffcb	movq	%rdi, %rbx
000000000003ffce	callq	__ZN6HGNode9ClearBitsEv         ## HGNode::ClearBits()
000000000003ffd3	movss	-0xc(%rbp), %xmm0
000000000003ffd8	mulss	0x38a310(%rip), %xmm0
000000000003ffe0	movss	%xmm0, 0x198(%rbx)
000000000003ffe8	movss	%xmm0, 0x19c(%rbx)
000000000003fff0	movq	0x1a8(%rbx), %rdi
000000000003fff7	movq	(%rdi), %rax
000000000003fffa	movq	0x60(%rax), %rax
000000000003fffe	xorps	%xmm2, %xmm2
0000000000040001	xorps	%xmm3, %xmm3
0000000000040004	xorl	%esi, %esi
0000000000040006	movaps	%xmm0, %xmm1
0000000000040009	addq	$0x8, %rsp
000000000004000d	popq	%rbx
000000000004000e	popq	%rbp
000000000004000f	jmpq	*%rax
0000000000040011	nopw	%cs:(%rax,%rax)
