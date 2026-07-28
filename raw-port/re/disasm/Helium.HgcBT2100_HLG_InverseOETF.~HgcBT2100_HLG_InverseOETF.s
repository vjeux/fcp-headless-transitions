__ZN25HgcBT2100_HLG_InverseOETFD0Ev:
00000000003b20a0	pushq	%rbp
00000000003b20a1	movq	%rsp, %rbp
00000000003b20a4	pushq	%rbx
00000000003b20a5	pushq	%rax
00000000003b20a6	movq	%rdi, %rbx
00000000003b20a9	leaq	0x6a2a70(%rip), %rax
00000000003b20b0	movq	%rax, (%rdi)
00000000003b20b3	movq	0x198(%rdi), %rax
00000000003b20ba	testq	%rax, %rax
00000000003b20bd	je	0x3b20cd
00000000003b20bf	movq	-0x8(%rax), %rdi
00000000003b20c3	testq	%rdi, %rdi
00000000003b20c6	je	0x3b20cd
00000000003b20c8	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
00000000003b20cd	movq	%rbx, %rdi
00000000003b20d0	callq	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
00000000003b20d5	movq	%rbx, %rdi
00000000003b20d8	addq	$0x8, %rsp
00000000003b20dc	popq	%rbx
00000000003b20dd	popq	%rbp
00000000003b20de	jmp	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
00000000003b20e3	nopw	%cs:(%rax,%rax)
