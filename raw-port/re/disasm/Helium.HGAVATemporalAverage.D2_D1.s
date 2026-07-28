__ZN20HGAVATemporalAverageD2Ev:
0000000000212db0	pushq	%rbp
0000000000212db1	movq	%rsp, %rbp
0000000000212db4	pushq	%rbx
0000000000212db5	pushq	%rax
0000000000212db6	leaq	0x81cb2b(%rip), %rax
0000000000212dbd	movq	%rax, (%rdi)
0000000000212dc0	movq	0x198(%rdi), %rax
0000000000212dc7	testq	%rax, %rax
0000000000212dca	je	0x212ddb
0000000000212dcc	movq	(%rax), %rcx
0000000000212dcf	movq	%rdi, %rbx
0000000000212dd2	movq	%rax, %rdi
0000000000212dd5	callq	*0x18(%rcx)
0000000000212dd8	movq	%rbx, %rdi
0000000000212ddb	addq	$0x8, %rsp
0000000000212ddf	popq	%rbx
0000000000212de0	popq	%rbp
0000000000212de1	jmp	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
0000000000212de6	movq	%rax, %rdi
0000000000212de9	callq	___clang_call_terminate
0000000000212dee	nop
__ZN20HGAVATemporalAverageD1Ev:
0000000000212df0	pushq	%rbp
0000000000212df1	movq	%rsp, %rbp
0000000000212df4	pushq	%rbx
0000000000212df5	pushq	%rax
0000000000212df6	leaq	0x81caeb(%rip), %rax
0000000000212dfd	movq	%rax, (%rdi)
0000000000212e00	movq	0x198(%rdi), %rax
0000000000212e07	testq	%rax, %rax
0000000000212e0a	je	0x212e1b
0000000000212e0c	movq	(%rax), %rcx
0000000000212e0f	movq	%rdi, %rbx
0000000000212e12	movq	%rax, %rdi
0000000000212e15	callq	*0x18(%rcx)
0000000000212e18	movq	%rbx, %rdi
0000000000212e1b	addq	$0x8, %rsp
0000000000212e1f	popq	%rbx
0000000000212e20	popq	%rbp
0000000000212e21	jmp	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
0000000000212e26	movq	%rax, %rdi
0000000000212e29	callq	___clang_call_terminate
0000000000212e2e	nop
__ZN20HGAVATemporalAverageD0Ev:
