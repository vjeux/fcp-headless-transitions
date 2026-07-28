__ZN16HGDitherLUTEntryD0Ev:
0000000000070210	pushq	%rbp
0000000000070211	movq	%rsp, %rbp
0000000000070214	pushq	%rbx
0000000000070215	pushq	%rax
0000000000070216	movq	%rdi, %rbx
0000000000070219	leaq	0x9989f8(%rip), %rax
0000000000070220	movq	%rax, (%rdi)
0000000000070223	movq	0x20(%rdi), %rdi
0000000000070227	testq	%rdi, %rdi
000000000007022a	je	0x70232
000000000007022c	movq	(%rdi), %rax
000000000007022f	callq	*0x18(%rax)
0000000000070232	movq	0x18(%rbx), %rdi
0000000000070236	testq	%rdi, %rdi
0000000000070239	je	0x70241
000000000007023b	movq	(%rdi), %rax
000000000007023e	callq	*0x18(%rax)
0000000000070241	movq	%rbx, %rdi
0000000000070244	callq	__ZN10HGLUTCache8LUTEntryD2Ev   ## HGLUTCache::LUTEntry::~LUTEntry()
0000000000070249	movq	%rbx, %rdi
000000000007024c	addq	$0x8, %rsp
0000000000070250	popq	%rbx
0000000000070251	popq	%rbp
0000000000070252	jmp	0x3c4fa0                        ## symbol stub for: __ZdlPv
0000000000070257	movq	%rax, %rdi
000000000007025a	callq	___clang_call_terminate
000000000007025f	movq	%rax, %rdi
0000000000070262	callq	___clang_call_terminate
0000000000070267	nopw	(%rax,%rax)
