__ZN18HgcBT2100_HLG_OETFD0Ev:
00000000003b11c0	pushq	%rbp
00000000003b11c1	movq	%rsp, %rbp
00000000003b11c4	pushq	%rbx
00000000003b11c5	pushq	%rax
00000000003b11c6	movq	%rdi, %rbx
00000000003b11c9	leaq	0x6a36f8(%rip), %rax
00000000003b11d0	movq	%rax, (%rdi)
00000000003b11d3	movq	0x198(%rdi), %rax
00000000003b11da	testq	%rax, %rax
00000000003b11dd	je	0x3b11ed
00000000003b11df	movq	-0x8(%rax), %rdi
00000000003b11e3	testq	%rdi, %rdi
00000000003b11e6	je	0x3b11ed
00000000003b11e8	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
00000000003b11ed	movq	%rbx, %rdi
00000000003b11f0	callq	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
00000000003b11f5	movq	%rbx, %rdi
00000000003b11f8	addq	$0x8, %rsp
00000000003b11fc	popq	%rbx
00000000003b11fd	popq	%rbp
00000000003b11fe	jmp	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
00000000003b1203	nopw	%cs:(%rax,%rax)
