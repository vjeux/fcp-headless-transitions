__ZN18HGHybridQTGammaLog6EncodeD0Ev:
0000000000101fc0	pushq	%rbp
0000000000101fc1	movq	%rsp, %rbp
0000000000101fc4	pushq	%rbx
0000000000101fc5	pushq	%rax
0000000000101fc6	movq	%rdi, %rbx
0000000000101fc9	leaq	0x916130(%rip), %rax
0000000000101fd0	movq	%rax, (%rdi)
0000000000101fd3	movq	0x198(%rdi), %rdi
0000000000101fda	testq	%rdi, %rdi
0000000000101fdd	je	0x101fe5
0000000000101fdf	movq	(%rdi), %rax
0000000000101fe2	callq	*0x18(%rax)
0000000000101fe5	movq	%rbx, %rdi
0000000000101fe8	callq	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
0000000000101fed	movq	%rbx, %rdi
0000000000101ff0	addq	$0x8, %rsp
0000000000101ff4	popq	%rbx
0000000000101ff5	popq	%rbp
0000000000101ff6	jmp	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
0000000000101ffb	movq	%rax, %rdi
0000000000101ffe	callq	___clang_call_terminate
0000000000102003	nopw	%cs:(%rax,%rax)
