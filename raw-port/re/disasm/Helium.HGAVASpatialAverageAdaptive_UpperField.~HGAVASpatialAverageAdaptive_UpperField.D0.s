__ZN38HGAVASpatialAverageAdaptive_UpperFieldD0Ev:
0000000000222060	pushq	%rbp
0000000000222061	movq	%rsp, %rbp
0000000000222064	pushq	%rbx
0000000000222065	pushq	%rax
0000000000222066	movq	%rdi, %rbx
0000000000222069	leaq	0x80ecb8(%rip), %rax
0000000000222070	movq	%rax, (%rdi)
0000000000222073	movq	0x198(%rdi), %rax
000000000022207a	testq	%rax, %rax
000000000022207d	je	0x22208d
000000000022207f	movq	-0x8(%rax), %rdi
0000000000222083	testq	%rdi, %rdi
0000000000222086	je	0x22208d
0000000000222088	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
000000000022208d	movq	%rbx, %rdi
0000000000222090	callq	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
0000000000222095	movq	%rbx, %rdi
0000000000222098	addq	$0x8, %rsp
000000000022209c	popq	%rbx
000000000022209d	popq	%rbp
000000000022209e	jmp	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
00000000002220a3	nopw	%cs:(%rax,%rax)
