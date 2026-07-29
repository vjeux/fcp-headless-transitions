
/tmp/ProCore.x86_64:	file format mach-o 64-bit x86-64

Disassembly of section __TEXT,__text:

0000000000021994 <__ZNK6PCUUID6toCStrEv>:
   21994: 55                           	pushq	%rbp
   21995: 48 89 e5                     	movq	%rsp, %rbp
   21998: 41 56                        	pushq	%r14
   2199a: 53                           	pushq	%rbx
   2199b: 48 83 ec 40                  	subq	$0x40, %rsp
   2199f: 49 89 fe                     	movq	%rdi, %r14
   219a2: 48 8b 05 77 68 12 00         	movq	0x126877(%rip), %rax    ## 0x148220 <_xmlTextReaderReadString+0x148220>
   219a9: 48 8b 00                     	movq	(%rax), %rax
   219ac: 48 89 45 e8                  	movq	%rax, -0x18(%rbp)
   219b0: bf 29 00 00 00               	movl	$0x29, %edi
   219b5: be 01 00 00 00               	movl	$0x1, %esi
   219ba: e8 e5 cd 0b 00               	callq	0xde7a4 <_xmlTextReaderReadString+0xde7a4>
   219bf: 48 89 c3                     	movq	%rax, %rbx
   219c2: 41 8b 0e                     	movl	(%r14), %ecx
   219c5: 45 8b 46 04                  	movl	0x4(%r14), %r8d
   219c9: 45 8b 4e 08                  	movl	0x8(%r14), %r9d
   219cd: 41 8b 46 0c                  	movl	0xc(%r14), %eax
   219d1: 89 04 24                     	movl	%eax, (%rsp)
   219d4: 48 8d 15 2a 00 11 00         	leaq	0x11002a(%rip), %rdx    ## 0x131a05 <_xmlTextReaderReadString+0x131a05>
   219db: 4c 8d 75 c0                  	leaq	-0x40(%rbp), %r14
   219df: be 28 00 00 00               	movl	$0x28, %esi
   219e4: 4c 89 f7                     	movq	%r14, %rdi
   219e7: 31 c0                        	xorl	%eax, %eax
   219e9: e8 4c d1 0b 00               	callq	0xdeb3a <_xmlTextReaderReadString+0xdeb3a>
   219ee: 48 b8 20 20 2d 20 20 20 20 2d	movabsq	$0x2d202020202d2020, %rax ## imm = 0x2D202020202D2020
   219f8: 48 89 43 10                  	movq	%rax, 0x10(%rbx)
   219fc: 0f 10 05 13 00 11 00         	movups	0x110013(%rip), %xmm0   ## 0x131a16 <_xmlTextReaderReadString+0x131a16>
   21a03: 0f 11 03                     	movups	%xmm0, (%rbx)
   21a06: 49 8b 06                     	movq	(%r14), %rax
   21a09: 48 89 03                     	movq	%rax, (%rbx)
   21a0c: 41 8b 46 08                  	movl	0x8(%r14), %eax
   21a10: 89 43 09                     	movl	%eax, 0x9(%rbx)
   21a13: 41 8b 46 0c                  	movl	0xc(%r14), %eax
   21a17: 89 43 0e                     	movl	%eax, 0xe(%rbx)
   21a1a: 41 8b 46 10                  	movl	0x10(%r14), %eax
   21a1e: 89 43 13                     	movl	%eax, 0x13(%rbx)
   21a21: 49 8b 46 14                  	movq	0x14(%r14), %rax
   21a25: 48 89 43 18                  	movq	%rax, 0x18(%rbx)
   21a29: 41 8b 46 1c                  	movl	0x1c(%r14), %eax
   21a2d: 89 43 20                     	movl	%eax, 0x20(%rbx)
   21a30: 48 8b 05 e9 67 12 00         	movq	0x1267e9(%rip), %rax    ## 0x148220 <_xmlTextReaderReadString+0x148220>
   21a37: 48 8b 00                     	movq	(%rax), %rax
   21a3a: 48 3b 45 e8                  	cmpq	-0x18(%rbp), %rax
   21a3e: 75 0c                        	jne	0x21a4c <__ZNK6PCUUID6toCStrEv+0xb8>
   21a40: 48 89 d8                     	movq	%rbx, %rax
   21a43: 48 83 c4 40                  	addq	$0x40, %rsp
   21a47: 5b                           	popq	%rbx
   21a48: 41 5e                        	popq	%r14
   21a4a: 5d                           	popq	%rbp
   21a4b: c3                           	retq
   21a4c: e8 f3 cc 0b 00               	callq	0xde744 <_xmlTextReaderReadString+0xde744>
   21a51: 00 55 48                     	addb	%dl, 0x48(%rbp)
