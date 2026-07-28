__ZN38HGAVASpatialAverageAdaptive_LowerFieldD0Ev:
0000000000221f30	pushq	%rbp
0000000000221f31	movq	%rsp, %rbp
0000000000221f34	pushq	%rbx
0000000000221f35	pushq	%rax
0000000000221f36	movq	%rdi, %rbx
0000000000221f39	leaq	0x80f028(%rip), %rax
0000000000221f40	movq	%rax, (%rdi)
0000000000221f43	movq	0x198(%rdi), %rax
0000000000221f4a	testq	%rax, %rax
0000000000221f4d	je	0x221f5d
0000000000221f4f	movq	-0x8(%rax), %rdi
0000000000221f53	testq	%rdi, %rdi
0000000000221f56	je	0x221f5d
0000000000221f58	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
0000000000221f5d	movq	%rbx, %rdi
0000000000221f60	callq	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
0000000000221f65	movq	%rbx, %rdi
0000000000221f68	addq	$0x8, %rsp
0000000000221f6c	popq	%rbx
0000000000221f6d	popq	%rbp
0000000000221f6e	jmp	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
0000000000221f73	nopw	%cs:(%rax,%rax)
