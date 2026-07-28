__ZN17HGCameraLogEncodeC1EN14HGColorConform30hgColorConformRAWToLogEncodingE:
0000000000105ca0	pushq	%rbp
0000000000105ca1	movq	%rsp, %rbp
0000000000105ca4	pushq	%r14
0000000000105ca6	pushq	%rbx
0000000000105ca7	movl	%esi, %ebx
0000000000105ca9	movq	%rdi, %r14
0000000000105cac	callq	__ZN6HGNodeC2Ev                 ## HGNode::HGNode()
0000000000105cb1	leaq	0x914cc8(%rip), %rax
0000000000105cb8	movq	%rax, (%r14)
0000000000105cbb	movq	$0x0, 0x198(%r14)
0000000000105cc6	movl	%ebx, 0x1a0(%r14)
0000000000105ccd	popq	%rbx
0000000000105cce	popq	%r14
0000000000105cd0	popq	%rbp
0000000000105cd1	retq
0000000000105cd2	nopw	%cs:(%rax,%rax)
