__ZN20HgcAVAMotionDilationD0Ev:
0000000000216880	pushq	%rbp
0000000000216881	movq	%rsp, %rbp
0000000000216884	pushq	%rbx
0000000000216885	pushq	%rax
0000000000216886	movq	%rdi, %rbx
0000000000216889	leaq	0x819958(%rip), %rax
0000000000216890	movq	%rax, (%rdi)
0000000000216893	movq	0x198(%rdi), %rax
000000000021689a	testq	%rax, %rax
000000000021689d	je	0x2168ad
000000000021689f	movq	-0x8(%rax), %rdi
00000000002168a3	testq	%rdi, %rdi
00000000002168a6	je	0x2168ad
00000000002168a8	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
00000000002168ad	movq	%rbx, %rdi
00000000002168b0	callq	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
00000000002168b5	movq	%rbx, %rdi
00000000002168b8	addq	$0x8, %rsp
00000000002168bc	popq	%rbx
00000000002168bd	popq	%rbp
00000000002168be	jmp	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
00000000002168c3	nopw	%cs:(%rax,%rax)
