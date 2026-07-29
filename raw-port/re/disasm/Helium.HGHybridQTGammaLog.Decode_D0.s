__ZN18HGHybridQTGammaLog6DecodeD0Ev:
0000000000102230	pushq	%rbp
0000000000102231	movq	%rsp, %rbp
0000000000102234	pushq	%rbx
0000000000102235	pushq	%rax
0000000000102236	movq	%rdi, %rbx
0000000000102239	leaq	0x916100(%rip), %rax
0000000000102240	movq	%rax, (%rdi)
0000000000102243	movq	0x198(%rdi), %rdi
000000000010224a	testq	%rdi, %rdi
000000000010224d	je	0x102255
000000000010224f	movq	(%rdi), %rax
0000000000102252	callq	*0x18(%rax)
0000000000102255	movq	%rbx, %rdi
0000000000102258	callq	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
000000000010225d	movq	%rbx, %rdi
0000000000102260	addq	$0x8, %rsp
0000000000102264	popq	%rbx
0000000000102265	popq	%rbp
0000000000102266	jmp	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
000000000010226b	movq	%rax, %rdi
000000000010226e	callq	___clang_call_terminate
0000000000102273	nopw	%cs:(%rax,%rax)
