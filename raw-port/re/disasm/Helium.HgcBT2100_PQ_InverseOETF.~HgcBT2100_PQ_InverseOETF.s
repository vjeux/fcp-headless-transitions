__ZN24HgcBT2100_PQ_InverseOETFD0Ev:
00000000003ae6c0	pushq	%rbp
00000000003ae6c1	movq	%rsp, %rbp
00000000003ae6c4	pushq	%rbx
00000000003ae6c5	pushq	%rax
00000000003ae6c6	movq	%rdi, %rbx
00000000003ae6c9	leaq	0x6a5d48(%rip), %rax
00000000003ae6d0	movq	%rax, (%rdi)
00000000003ae6d3	movq	0x198(%rdi), %rax
00000000003ae6da	testq	%rax, %rax
00000000003ae6dd	je	0x3ae6ed
00000000003ae6df	movq	-0x8(%rax), %rdi
00000000003ae6e3	testq	%rdi, %rdi
00000000003ae6e6	je	0x3ae6ed
00000000003ae6e8	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
00000000003ae6ed	movq	%rbx, %rdi
00000000003ae6f0	callq	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
00000000003ae6f5	movq	%rbx, %rdi
00000000003ae6f8	addq	$0x8, %rsp
00000000003ae6fc	popq	%rbx
00000000003ae6fd	popq	%rbp
00000000003ae6fe	jmp	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
00000000003ae703	nopw	%cs:(%rax,%rax)
