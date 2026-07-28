__ZN21HgcAVAMotionDetectionD0Ev:
0000000000214280	pushq	%rbp
0000000000214281	movq	%rsp, %rbp
0000000000214284	pushq	%rbx
0000000000214285	pushq	%rax
0000000000214286	movq	%rdi, %rbx
0000000000214289	leaq	0x81b898(%rip), %rax
0000000000214290	movq	%rax, (%rdi)
0000000000214293	movq	0x198(%rdi), %rax
000000000021429a	testq	%rax, %rax
000000000021429d	je	0x2142ad
000000000021429f	movq	-0x8(%rax), %rdi
00000000002142a3	testq	%rdi, %rdi
00000000002142a6	je	0x2142ad
00000000002142a8	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
00000000002142ad	movq	%rbx, %rdi
00000000002142b0	callq	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
00000000002142b5	movq	%rbx, %rdi
00000000002142b8	addq	$0x8, %rsp
00000000002142bc	popq	%rbx
00000000002142bd	popq	%rbp
00000000002142be	jmp	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
00000000002142c3	nopw	%cs:(%rax,%rax)
